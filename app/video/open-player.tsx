// Powered by OnSpace.AI
// Open Player — Universal / Web fallback
//
// Expo Router requires a platform-extension-less sibling alongside
// open-player.android.tsx and open-player.ios.tsx.
// This file serves as the fallback for web (and any unlisted platform).
// It uses the WebView-only path (same as Android) — expo-video is NOT imported.

export { default } from './open-player.android';
