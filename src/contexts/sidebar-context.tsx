"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load sidebar state from localStorage
    const savedState = localStorage.getItem("sidebar-open");
    if (savedState !== null) {
      setIsOpen(savedState === "true");
    }
  }, []);

  const toggle = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-open", String(newState));
      return newState;
    });
  };

  const open = () => {
    setIsOpen(true);
    localStorage.setItem("sidebar-open", "true");
  };

  const close = () => {
    setIsOpen(false);
    localStorage.setItem("sidebar-open", "false");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  // Return default values if context is not available (e.g., during SSR/static generation)
  if (context === undefined) {
    return {
      isOpen: true,
      toggle: () => {},
      open: () => {},
      close: () => {},
    };
  }
  return context;
}

