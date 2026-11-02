/**
 * Thin wrapper around next-themes ThemeProvider.
 * Replaces Angular/jQuery theme switching.
 *
 * Usage:
 *   Wrap <App> (or any subtree) with <AppThemeProvider>.
 *   Components use `useTheme()` from next-themes for theme access.
 *
 * Defaults to 'light'. Supported themes: 'light', 'dark'.
 * TAHAnalyse theme tokens (HSL CSS variables) are defined in index.css
 * and are toggled via the `dark` class on <html>.
 */

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function AppThemeProvider({ children }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
