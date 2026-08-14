"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("rc-theme") as Theme | null;
    const initial =
      stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem("rc-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return (
    <SessionProvider>
      <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
    </SessionProvider>
  );
}
