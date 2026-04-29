// useDarkMode.js
// Persists dark mode preference in localStorage and toggles the
// "dark" class on <html> which Tailwind's darkMode: "class" reads.

import { useState, useEffect } from "react";

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("docvault-theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("docvault-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("docvault-theme", "light");
    }
  }, [dark]);

  return [dark, setDark];
}
