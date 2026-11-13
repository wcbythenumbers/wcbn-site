import { Playfair_Display, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google';

// Self-hosted at build time by next/font, so no request goes to Google.
// Each font is exposed as a CSS variable on <html> (see app/layout.js), and
// globals.css maps them onto --font-display / --font-body / --font-mono.
// The fallback lists match the stacks the site used with the old @import.

export const playfairDisplay = Playfair_Display({
  weight: ['700', '900'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: false,
  variable: '--font-playfair-display',
});

export const sourceSerif4 = Source_Serif_4({
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: false,
  variable: '--font-source-serif-4',
});

export const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  fallback: ['monospace'],
  adjustFontFallback: false,
  variable: '--font-ibm-plex-mono',
});
