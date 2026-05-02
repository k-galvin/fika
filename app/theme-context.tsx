"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

type ThemeContextType = {
  isAfterHours: boolean;
  setIsAfterHours: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isAfterHours, setIsAfterHours] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAfterHours(false);
  }, [pathname]);

  return (
    <ThemeContext.Provider value={{ isAfterHours, setIsAfterHours }}>
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
