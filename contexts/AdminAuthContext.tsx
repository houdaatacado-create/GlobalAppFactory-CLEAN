// Powered by OnSpace.AI
// Admin Auth Context — Supabase Auth for pipeline admin access only
//
// Security model:
// - Uses Supabase Auth email/password sign-in
// - After sign-in, verifies admin status by calling the process-video Edge Function
// - JWT (access_token) is passed to all admin Edge Function calls
// - admin_users table is only readable by service role — never exposed to client
// - No EXPO_PUBLIC secrets for admin access

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { createClient, Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Supabase client (auth only) ─────────────────────────────────────────────

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

let _adminSupabase: ReturnType<typeof createClient> | null = null;

function getAdminSupabase() {
  if (_adminSupabase) return _adminSupabase;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  _adminSupabase = createClient(url, key, {
    auth: {
      storage: buildStorageAdapter() as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return _adminSupabase;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminAuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isCheckingAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  accessToken: string | null;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// ─── Verify admin status via Edge Function ────────────────────────────────────
// Calls action=check_admin — returns 200 if admin, 403 if not.
// Never reads admin_users table directly from client.

async function checkAdminStatus(accessToken: string): Promise<boolean> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  if (!url || !accessToken) return false;
  try {
    const resp = await fetch(`${url}/functions/v1/process-video?action=check_admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });
    return resp.status === 200;
  } catch {
    return false;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const verifyAdmin = useCallback(async (token: string) => {
    setIsCheckingAdmin(true);
    const admin = await checkAdminStatus(token);
    setIsAdmin(admin);
    setIsCheckingAdmin(false);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const sb = getAdminSupabase();
    if (!sb) { setIsLoading(false); return; }

    sb.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.access_token) {
        verifyAdmin(s.access_token).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.access_token) {
        await verifyAdmin(s.access_token);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [verifyAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    const sb = getAdminSupabase();
    if (!sb) return { error: 'Supabase not configured' };
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.session?.access_token) {
      const admin = await checkAdminStatus(data.session.access_token);
      if (!admin) {
        await sb.auth.signOut();
        return { error: 'This account does not have admin access.' };
      }
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    const sb = getAdminSupabase();
    if (sb) await sb.auth.signOut();
    setIsAdmin(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{
      session,
      user,
      isAdmin,
      isLoading,
      isCheckingAdmin,
      signIn,
      signOut,
      accessToken: session?.access_token ?? null,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
