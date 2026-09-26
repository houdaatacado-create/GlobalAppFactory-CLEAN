// Powered by OnSpace.AI
// Entry point - redirects based on onboarding state
import { Redirect } from 'expo-router';
import { useApp } from '../hooks/useApp';

export default function Index() {
  const { hasOnboarded } = useApp();
  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/" />;
}
