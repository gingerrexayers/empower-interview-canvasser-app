import { useEffect } from "preact/hooks";

import type { ComponentChildren } from "preact";

type ThemeProviderProps = {
  children: ComponentChildren;
};

// This component now only sets the light theme and does not provide a context.
export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add("light");
  }, []);

  return <>{children}</>;
}
