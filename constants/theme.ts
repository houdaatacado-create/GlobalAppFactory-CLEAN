// Powered by OnSpace.AI
// Islamic App - Global Theme System

export const Colors = {
  // Primary Brand
  primary: '#1B6B47',        // Emerald Green
  primaryLight: '#2D8A5E',
  primaryDark: '#0F4A30',
  primaryDeep: '#0A3020',

  // Gold Accent
  gold: '#C9A84C',
  goldLight: '#E4C97A',
  goldDark: '#9A7A30',
  goldGlow: '#FFD700',

  // Background Surfaces
  background: '#060F0A',     // Near Black Green
  surface: '#0D1F14',        // Dark Green Surface
  surfaceLight: '#152B1C',   // Lighter Surface
  surfaceCard: '#1A3225',    // Card Background
  surfaceElevated: '#1F3D2C',

  // Text
  textPrimary: '#F5F0E8',    // Warm White
  textSecondary: '#A8B8A0',  // Muted Green-Gray
  textMuted: '#5A7A60',
  textGold: '#C9A84C',
  textInverse: '#060F0A',

  // Semantic
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',

  // UI Elements
  border: '#1E3D28',
  borderLight: '#2A5038',
  divider: '#132218',
  overlay: 'rgba(6, 15, 10, 0.85)',
  overlayLight: 'rgba(27, 107, 71, 0.15)',

  // Tab Bar
  tabActive: '#C9A84C',
  tabInactive: '#3A5A40',
  tabBackground: '#0A1A10',

  // Gradients (for reference)
  gradientPrimary: ['#0A3020', '#1B6B47'],
  gradientGold: ['#9A7A30', '#FFD700'],
  gradientCard: ['#152B1C', '#0D1F14'],
  gradientHero: ['rgba(6,15,10,0)', 'rgba(6,15,10,0.95)'],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  body: 16,
  md: 18,
  lg: 20,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  hero: 48,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  gold: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
};
