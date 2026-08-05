"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({
  className = "",
  variant = "icon",
}: {
  className?: string;
  variant?: "icon" | "switch";
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  if (variant === "switch") {
    return (
      <button
        role="switch"
        aria-checked={isDark}
        onClick={toggle}
        aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none ${
          isDark ? "bg-[#1a6aad]" : "bg-zinc-300"
        } ${className}`}
      >
        <span
          className={`inline-flex h-[18px] w-[18px] transform items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${
            isDark ? "translate-x-[22px]" : "translate-x-[2px]"
          }`}
        >
          {isDark ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className={className}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}
