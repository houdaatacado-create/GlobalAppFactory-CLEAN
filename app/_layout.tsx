// Powered by OnSpace.AI
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AppProvider } from '../contexts/AppContext';
import { AdminAuthProvider } from '../contexts/AdminAuthContext';
import { useEffect, Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchReadyCatalog, preloadCDNCatalog } from '../services/videoPipelineService';
import { QuranAudioProvider } from '../contexts/QuranAudioContext';
import { fetchPublishedVideos } from '../hooks/usePublishedVideos';
import { preloadVideoPrefs } from '../services/videoPlayerPrefsService';

// ── Top-level error boundary ─────────────────────────────────────────────────
// Catches native module init crashes (e.g. ExoPlayer SimpleCache conflict)
// so the app can still render instead of showing a blank screen.
class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || 'Unknown error' };
  }
  componentDidCatch(error: any) {
    console.error('[AppErrorBoundary]', error?.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={eb.container}>
          <Text style={eb.title}>Something went wrong</Text>
          <Text style={eb.body}>Please force-close and reopen the app.{this.state.error ? `\n\n${this.state.error}` : ''}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
const eb = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060F0A', alignItems: 'center', justifyContent: 'center', padding: 32 },
  title:     { color: '#C9A84C', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  body:      { color: '#9CA3AF', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

export default function RootLayout() {
  // Preload CDN catalog + player prefs on app start
  useEffect(() => {
    fetchPublishedVideos().then(records => {
      preloadCDNCatalog(records);
    }).catch(() => {
      // Supabase not reachable — sync cache stays empty
    });
    preloadVideoPrefs().catch(() => {});
  }, []);

  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
      <LanguageProvider>
        <AppProvider>
        <QuranAudioProvider>
        <AdminAuthProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="qibla" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="azkar" options={{ headerShown: false }} />
            <Stack.Screen name="hadith" options={{ headerShown: false }} />
            <Stack.Screen name="learn/index" options={{ headerShown: false }} />
            <Stack.Screen name="learn/[categoryId]" options={{ headerShown: false }} />
            <Stack.Screen name="learn/lesson/[lessonId]" options={{ headerShown: false }} />
            <Stack.Screen name="hajj" options={{ headerShown: false }} />
            <Stack.Screen name="calendar" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="language-select" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="video/[id]" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="video/open-player" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="quran/[surah]" options={{ headerShown: false }} />
            <Stack.Screen name="editorial" options={{ headerShown: false }} />
            {/* pipeline-admin removed from public app — access via separate web admin portal */}
            <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
            <Stack.Screen name="delete-account" options={{ headerShown: false }} />
            <Stack.Screen name="support" options={{ headerShown: false }} />
            <Stack.Screen name="terms" options={{ headerShown: false }} />
          </Stack>
        </AdminAuthProvider>
        </QuranAudioProvider>
        </AppProvider>
      </LanguageProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
