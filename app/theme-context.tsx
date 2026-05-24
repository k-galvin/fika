"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

type ThemeContextType = {
  isAfterHours: boolean;
  setIsAfterHours: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isAfterHours, setIsAfterHours] = useState(false);
  const [prevPathname, setPrevPathname] = useState("");
  const pathname = usePathname();

  if (pathname !== prevPathname) {
    setIsAfterHours(false);
    setPrevPathname(pathname);
  }

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
