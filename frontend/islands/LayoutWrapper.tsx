/** @jsxImportSource preact */
import { useState, useEffect, ComponentChildren } from "preact/hooks";
import Sidebar from "./Sidebar.tsx";
import NavbarActions from "./NavbarActions.tsx";

interface LayoutWrapperProps {
  children: ComponentChildren;
  showFooter?: boolean;
}

export default function LayoutWrapper({ children, showFooter = true }: LayoutWrapperProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <nav class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 fixed top-0 z-20 h-16 transition-all duration-300"
           style={{ left: isMobile ? '0rem' : 'var(--sidebar-width)', right: 0 }}>
        <div class="h-full px-4 sm:px-6 lg:px-8 flex justify-start items-center gap-4">
          {isMobile && (
            <button
              onClick={() => setMobileOpen(true)}
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Buka sidebar"
            >
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          <div class="flex-1"></div>
          <NavbarActions />
        </div>
      </nav>

      <main class="pt-16 min-h-screen transition-all duration-300"
            style={{ marginLeft: isMobile ? '0rem' : 'var(--sidebar-width)' }}>
        <div class="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto transition-all duration-300">
          {children}
        </div>
      </main>

      {showFooter && (
        <footer class="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-auto transition-all duration-300"
                style={{ marginLeft: isMobile ? '0rem' : 'var(--sidebar-width)' }}>
          <div class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 Koperasi Simpan Pinjaman Magetan
          </div>
        </footer>
      )}
    </div>
  );
}