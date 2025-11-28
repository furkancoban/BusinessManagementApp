"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark" | "blue" | "green" | "purple" | "orange";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && ["light", "dark", "blue", "green", "purple", "orange"].includes(savedTheme)) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("light");
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "blue", "green", "purple", "orange");
    
    // Add new theme class
    root.classList.add(newTheme);
    
    // Apply theme-specific CSS variables
    const themes: Record<Theme, Record<string, string>> = {
      light: {
        "--background": "0 0% 100%",
        "--foreground": "222.2 84% 4.9%",
        "--card": "0 0% 100%",
        "--card-foreground": "222.2 84% 4.9%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "222.2 84% 4.9%",
        "--primary": "221.2 83.2% 53.3%",
        "--primary-foreground": "210 40% 98%",
        "--secondary": "210 40% 96.1%",
        "--secondary-foreground": "222.2 47.4% 11.2%",
        "--muted": "210 40% 96.1%",
        "--muted-foreground": "215.4 16.3% 46.9%",
        "--accent": "210 40% 96.1%",
        "--accent-foreground": "222.2 47.4% 11.2%",
        "--destructive": "0 84.2% 60.2%",
        "--destructive-foreground": "210 40% 98%",
        "--border": "214.3 31.8% 91.4%",
        "--input": "214.3 31.8% 91.4%",
        "--ring": "221.2 83.2% 53.3%",
      },
      dark: {
        "--background": "222.2 84% 4.9%",
        "--foreground": "210 40% 98%",
        "--card": "222.2 84% 4.9%",
        "--card-foreground": "210 40% 98%",
        "--popover": "222.2 84% 4.9%",
        "--popover-foreground": "210 40% 98%",
        "--primary": "217.2 91.2% 59.8%",
        "--primary-foreground": "222.2 47.4% 11.2%",
        "--secondary": "217.2 32.6% 17.5%",
        "--secondary-foreground": "210 40% 98%",
        "--muted": "217.2 32.6% 17.5%",
        "--muted-foreground": "215 20.2% 65.1%",
        "--accent": "217.2 32.6% 17.5%",
        "--accent-foreground": "210 40% 98%",
        "--destructive": "0 62.8% 30.6%",
        "--destructive-foreground": "210 40% 98%",
        "--border": "217.2 32.6% 17.5%",
        "--input": "217.2 32.6% 17.5%",
        "--ring": "224.3 76.3% 48%",
      },
      blue: {
        "--background": "210 40% 98%",
        "--foreground": "222.2 84% 4.9%",
        "--card": "0 0% 100%",
        "--card-foreground": "222.2 84% 4.9%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "222.2 84% 4.9%",
        "--primary": "217.2 91.2% 59.8%",
        "--primary-foreground": "222.2 47.4% 11.2%",
        "--secondary": "210 40% 96.1%",
        "--secondary-foreground": "222.2 47.4% 11.2%",
        "--muted": "210 40% 96.1%",
        "--muted-foreground": "215.4 16.3% 46.9%",
        "--accent": "217.2 91.2% 95%",
        "--accent-foreground": "222.2 47.4% 11.2%",
        "--destructive": "0 84.2% 60.2%",
        "--destructive-foreground": "210 40% 98%",
        "--border": "214.3 31.8% 91.4%",
        "--input": "214.3 31.8% 91.4%",
        "--ring": "217.2 91.2% 59.8%",
      },
      green: {
        "--background": "142.1 76.2% 96.3%",
        "--foreground": "142.1 76.2% 4.9%",
        "--card": "0 0% 100%",
        "--card-foreground": "142.1 76.2% 4.9%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "142.1 76.2% 4.9%",
        "--primary": "142.1 76.2% 36.3%",
        "--primary-foreground": "355.7 100% 97.3%",
        "--secondary": "142.1 76.2% 90%",
        "--secondary-foreground": "142.1 76.2% 4.9%",
        "--muted": "142.1 76.2% 90%",
        "--muted-foreground": "142.1 76.2% 30%",
        "--accent": "142.1 76.2% 95%",
        "--accent-foreground": "142.1 76.2% 4.9%",
        "--destructive": "0 84.2% 60.2%",
        "--destructive-foreground": "210 40% 98%",
        "--border": "142.1 76.2% 85%",
        "--input": "142.1 76.2% 85%",
        "--ring": "142.1 76.2% 36.3%",
      },
      purple: {
        "--background": "270 20% 98%",
        "--foreground": "270 20% 4.9%",
        "--card": "0 0% 100%",
        "--card-foreground": "270 20% 4.9%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "270 20% 4.9%",
        "--primary": "270 91.2% 65.8%",
        "--primary-foreground": "270 47.4% 11.2%",
        "--secondary": "270 20% 90%",
        "--secondary-foreground": "270 20% 4.9%",
        "--muted": "270 20% 90%",
        "--muted-foreground": "270 20% 30%",
        "--accent": "270 91.2% 95%",
        "--accent-foreground": "270 20% 4.9%",
        "--destructive": "0 84.2% 60.2%",
        "--destructive-foreground": "210 40% 98%",
        "--border": "270 20% 85%",
        "--input": "270 20% 85%",
        "--ring": "270 91.2% 65.8%",
      },
      orange: {
        "--background": "33 100% 96.5%",
        "--foreground": "26 83.3% 14.1%",
        "--card": "0 0% 100%",
        "--card-foreground": "26 83.3% 14.1%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "26 83.3% 14.1%",
        "--primary": "24.6 95% 53.1%",
        "--primary-foreground": "60 9.1% 97.8%",
        "--secondary": "33 100% 90%",
        "--secondary-foreground": "26 83.3% 14.1%",
        "--muted": "33 100% 90%",
        "--muted-foreground": "26 83.3% 30%",
        "--accent": "24.6 95% 95%",
        "--accent-foreground": "26 83.3% 14.1%",
        "--destructive": "0 84.2% 60.2%",
        "--destructive-foreground": "210 40% 98%",
        "--border": "33 100% 85%",
        "--input": "33 100% 85%",
        "--ring": "24.6 95% 53.1%",
      },
    };

    const themeVars = themes[newTheme];
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

