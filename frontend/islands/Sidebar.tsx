/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";

const menuItems = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/members", icon: "👥", label: "Anggota" },
  { href: "/savings", icon: "💾", label: "Simpanan" },
  { href: "/loans", icon: "💰", label: "Pinjaman" },
  { href: "/reports", icon: "📈", label: "Laporan" },
  { href: "/settings", icon: "⚙️", label: "Pengaturan" },
];

const SIDEBAR_WIDTH_EXPANDED = "16rem";
const SIDEBAR_WIDTH_COLLAPSED = "5rem";
const SIDEBAR_STORAGE_KEY = "ksp_sidebar_collapsed";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activePath, setActivePath] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted flag
    setMounted(true);
    
    // Set active path
    setActivePath(window.location.pathname);

    // Restore sidebar state from localStorage
    const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const wasCollapsed = savedState === "true";
    const shouldBeOpen = !wasCollapsed;
    
    setIsOpen(shouldBeOpen);

    // Set initial CSS variable based on restored state
    const initialWidth = shouldBeOpen ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;
    document.documentElement.style.setProperty('--sidebar-width', initialWidth);

    // Check mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        setIsOpen(false);
        document.documentElement.style.setProperty('--sidebar-width', '0rem');
      } else {
        // Restore desktop state
        const savedDesktopState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        const desktopOpen = savedDesktopState !== "true"; // default true
        setIsOpen(desktopOpen);
        const width = desktopOpen ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;
        document.documentElement.style.setProperty('--sidebar-width', width);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Save to localStorage (only for desktop)
    if (!isMobile) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!newState));
    }
    
    // Update CSS variable
    if (!isMobile) {
      const newWidth = newState ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;
      document.documentElement.style.setProperty('--sidebar-width', newWidth);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <aside class="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 z-40" />
    );
  }

  return (
    <>
      {/* Overlay Mobile */}
      {isMobile && isOpen && (
        <div 
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={toggle}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        class={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-all duration-300 ease-in-out z-40 flex flex-col ${
          isOpen ? "w-64" : "w-20"
        } ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        {/* Header & Toggle */}
        <div class="h-16 flex items-center justify-between px-4 border-b dark:border-gray-700 flex-shrink-0">
          <div class={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
            <span class="text-2xl">🏦</span>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
              KSP ERP
            </span>
          </div>
          
          <button
            onClick={toggle}
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 text-gray-500 dark:text-gray-400"
            aria-label={isOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            <svg 
              class={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav class="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = activePath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                class={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span class="text-xl flex-shrink-0 w-8 text-center">{item.icon}</span>
                <span class={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 absolute"}`}>
                  {item.label}
                </span>
                
                {/* Tooltip saat collapsed */}
                {!isOpen && (
                  <div class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                    <div class="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </a>
            );
          })}
        </nav>
      </aside>
    </>
  );
}