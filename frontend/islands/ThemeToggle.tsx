/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load saved theme
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    if (isDark) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button class="p-2 rounded-lg">
        <span class="text-gray-600">🌙</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? (
        <span class="text-yellow-400 text-xl">☀️</span>
      ) : (
        <span class="text-gray-600 dark:text-gray-300 text-xl">🌙</span>
      )}
    </button>
  );
}