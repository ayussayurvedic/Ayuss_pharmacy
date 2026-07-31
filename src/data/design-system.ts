/**
 * SS Pharmacy Admin Design System Tokens
 * Centralized Breakpoints, Typography scale, and Accessibility contrast tokens.
 */

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const TYPOGRAPHY = {
  fontSans: 'var(--font-outfit), var(--font-inter), system-ui, sans-serif',
  fontSerif: 'var(--font-playfair), Georgia, serif',
  fontMono: 'var(--font-jetbrains), ui-monospace, monospace',
  minFontSize: '12px',
  contrastMutedText: '#71717a', // WCAG AAA 4.5:1 compliant muted text
  contrastPrimaryText: '#0f172a',
} as const;

export const SPACING_SCALE = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;
