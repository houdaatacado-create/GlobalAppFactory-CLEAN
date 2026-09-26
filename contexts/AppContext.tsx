// Powered by OnSpace.AI
// App Context — Global state: user prefs, onboarding, auth session, subscription

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, Session, User } from '@supabase/supabase-js';

// ─── Supabase client (shared, singleton) ─────────────────────────────────────

function buildStorageAdapter() {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  }
  return AsyncStorage;
}

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (_supabase) return _supabase;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  _supabase = createClient(url, key, {
    auth: {
      storage: buildStorageAdapter() as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return _supabase;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserPrefs {
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  adhanSound: string;
  notifications: boolean;
  lastQuranSurah: number;
  lastQuranVerse: number;
  bookmarks: number[];
}

/** Status values mirror what is stored in public.subscriptions */
export type SubscriptionStatus = 'active' | 'expired' | 'none' | 'loading';

interface AppContextType {
  // Onboarding
  hasOnboarded: boolean;
  completeOnboarding: () => Promise<void>;

  // Preferences
  userPrefs: UserPrefs;
  updatePrefs: (prefs: Partial<UserPrefs>) => Promise<void>;

  // Auth
  session: Session | null;
  currentUser: User | null;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;

  // Subscription / Premium
  isPremium: boolean;
  subscriptionLoading: boolean;
  subscriptionStatus: SubscriptionStatus;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Constants ────────────────────────────────────────────────────────────────

const ONBOARDING_KEY = '@noor_onboarded';
const PREFS_KEY      = '@noor_prefs';

const DEFAULT_PREFS: UserPrefs = {
  city: '',
  country: '',
  latitude: null,
  longitude: null,
  adhanSound: 'mishary',
  notifications: true,
  lastQuranSurah: 1,
  lastQuranVerse: 1,
  bookmarks: [],
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded]     = useState(false);
  const [userPrefs, setUserPrefs]           = useState<UserPrefs>(DEFAULT_PREFS);
  const [prefsLoaded, setPrefsLoaded]       = useState(false);

  // Auth
  const [session, setSession]               = useState<Session | null>(null);
  const [currentUser, setCurrentUser]       = useState<User | null>(null);

  // Subscription
  const [isPremium, setIsPremium]           = useState(false);
  const [subscriptionLoading, setSubLoading] = useState(false);
  const [subscriptionStatus, setSubStatus]  = useState<SubscriptionStatus>('none');

  // ── Load prefs from AsyncStorage ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [onboarded, prefs] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(PREFS_KEY),
        ]);
        if (onboarded === 'true') setHasOnboarded(true);
        if (prefs) setUserPrefs({ ...DEFAULT_PREFS, ...JSON.parse(prefs) });
      } catch {
        // use defaults
      } finally {
        setPrefsLoaded(true);
      }
    })();
  }, []);

  // ── Subscription query ───────────────────────────────────────────────────
  // Queries public.subscriptions for the authenticated user.
  // Logic: status='active' AND entitlement='premium' AND current_period_end > now()
  // RLS guarantees the user can only read their own rows (auth.uid() = user_id).
  // provider and product_id are intentionally NOT filtered — any active premium
  // subscription works, including provider='reviewer' inserted for the reviewer account.
  const fetchSubscription = useCallback(async (userId: string) => {
    const sb = getSupabaseClient();
    if (!sb || !userId) {
      setIsPremium(false);
      setSubStatus('none');
      setSubLoading(false);
      return;
    }

    setSubLoading(true);
    try {
      const now = new Date().toISOString();
      const { data, error } = await sb
        .from('subscriptions')
        .select('status, entitlement, current_period_end, provider, product_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('entitlement', 'premium')
        .gt('current_period_end', now)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[AppContext] subscription query error:', error.message);
        setIsPremium(false);
        setSubStatus('none');
        return;
      }

      if (data) {
        setIsPremium(true);
        setSubStatus('active');
      } else {
        // Check if there's an expired record (for better UX messaging)
        const { data: expired } = await sb
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .eq('entitlement', 'premium')
          .limit(1)
          .maybeSingle();

        setIsPremium(false);
        setSubStatus(expired ? 'expired' : 'none');
      }
    } catch {
      setIsPremium(false);
      setSubStatus('none');
    } finally {
      setSubLoading(false);
    }
  }, []);

  // Clear subscription state when user signs out
  const clearSubscription = useCallback(() => {
    setIsPremium(false);
    setSubStatus('none');
    setSubLoading(false);
  }, []);

  // ── Auth initialization + session restoration ────────────────────────────
  useEffect(() => {
    const sb = getSupabaseClient();
    if (!sb) return;

    // Restore existing session
    sb.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setCurrentUser(s?.user ?? null);
      if (s?.user?.id) {
        fetchSubscription(s.user.id);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setCurrentUser(s?.user ?? null);
      if (s?.user?.id) {
        fetchSubscription(s.user.id);
      } else {
        clearSubscription();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchSubscription, clearSubscription]);

  // ── App foreground → refresh subscription (catches expiry) ───────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        const sb = getSupabaseClient();
        if (sb) sb.auth.startAutoRefresh();
        if (currentUser?.id) fetchSubscription(currentUser.id);
      } else {
        const sb = getSupabaseClient();
        if (sb) sb.auth.stopAutoRefresh();
      }
    });
    return () => sub.remove();
  }, [currentUser, fetchSubscription]);

  // ── Auth actions ─────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const sb = getSupabaseClient();
    if (!sb) return { error: 'Service not available' };
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabaseClient();
    if (sb) await sb.auth.signOut();
    clearSubscription();
  }, [clearSubscription]);

  // ── Prefs actions ─────────────────────────────────────────────────────────
  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasOnboarded(true);
  };

  const updatePrefs = async (prefs: Partial<UserPrefs>) => {
    const updated = { ...userPrefs, ...prefs };
    setUserPrefs(updated);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  };

  if (!prefsLoaded) return null;

  return (
    <AppContext.Provider value={{
      hasOnboarded,
      completeOnboarding,
      userPrefs,
      updatePrefs,
      session,
      currentUser,
      isGuest: !currentUser,
      signIn,
      signOut,
      isPremium,
      subscriptionLoading,
      subscriptionStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}
