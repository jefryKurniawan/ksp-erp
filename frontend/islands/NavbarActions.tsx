/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";
import { auth } from "../utils/auth.ts";

export default function NavbarActions() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<{name: string; role: 'karyawan' | 'owner'} | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    if (isDark) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }

    const savedUser = localStorage.getItem("ksp_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("ksp_user");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("ksp_user");
    setUser(null);
    window.location.href = "/login";
  };

  if (!mounted) {
    return <div class="w-32"></div>;
  }

  return (
    <>
      {/* Dark/Light Toggle */}
      <button
        onClick={toggleTheme}
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        title={darkMode ? "Mode Terang" : "Mode Gelap"}
      >
        {darkMode ? (
          <span class="text-yellow-400">☀️</span>
        ) : (
          <span class="text-gray-600">🌙</span>
        )}
      </button>

      {/* User Menu */}
      {user ? (
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-700 dark:text-gray-200 hidden md:inline">
            {user.name} • {user.role === 'owner' ? '👑 Owner' : '👤 Karyawan'}
          </span>
          <button
            onClick={handleLogout}
            class="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
          >
            Keluar
          </button>
        </div>
      ) : (
        <a 
          href="/login" 
          class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Login
        </a>
      )}
    </>
  );
}