/** @jsxImportSource preact */
import { ComponentChildren } from "preact";
import NavbarActions from "../islands/NavbarActions.tsx";
import Sidebar from "../islands/Sidebar.tsx";

interface LayoutProps {
  children: ComponentChildren;
  showFooter?: boolean;
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Sidebar - Island ini yang akan mengatur CSS Variable */}
      <Sidebar />

      {/* Top Navigation - Fixed di atas, margin-left mengikuti sidebar */}
      <nav class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 fixed top-0 z-20 h-16 transition-all duration-300"
           style={{ left: 'var(--sidebar-width)', right: 0 }}>
        <div class="h-full px-4 sm:px-6 lg:px-8 flex justify-end items-center">
          <NavbarActions />
        </div>
      </nav>

      {/* Main Content - Margin kiri mengikuti sidebar */}
      <main class="pt-16 min-h-screen transition-all duration-300"
            style={{ marginLeft: 'var(--sidebar-width)' }}>
        <div class="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto transition-all duration-300">
          {children}
        </div>
      </main>

      {/* Footer - Margin kiri mengikuti sidebar */}
      {showFooter && (
        <footer class="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-auto transition-all duration-300"
                style={{ marginLeft: 'var(--sidebar-width)' }}>
          <div class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 Koperasi Simpan Pinjaman Magetan
          </div>
        </footer>
      )}
    </div>
  );
}