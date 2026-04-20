/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";

export default function LandingHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Parallax Background */}
      <div 
        class="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      >
        {/* Pattern Overlay */}
        <div class="absolute inset-0 opacity-10 dark:opacity-5">
          <div class="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div class="absolute top-20 left-10 w-20 h-20 bg-white/10 dark:bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div class="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div class="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div class="space-y-8">
          <div class="inline-block px-4 py-2 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-full text-sm font-medium mb-4">
            ✨ Sistem Manajemen Koperasi Modern
          </div>
          
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Kelola Koperasi Anda
            <br />
            <span class="bg-gradient-to-r from-yellow-300 to-pink-300 dark:from-yellow-200 dark:to-pink-200 bg-clip-text text-transparent">
              Lebih Mudah & Efisien
            </span>
          </h1>
          
          <p class="text-lg md:text-xl text-gray-100 dark:text-gray-200 max-w-3xl mx-auto">
            Platform ERP terintegrasi untuk manajemen anggota, simpanan, pinjaman, 
            dan laporan keuangan koperasi secara real-time.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a 
              href="/dashboard" 
              class="px-8 py-4 bg-white text-blue-600 dark:bg-gray-100 dark:text-blue-400 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-200 transition transform hover:scale-105 shadow-2xl"
            >
              🚀 Coba Sekarang - Gratis
            </a>
            <a 
              href="#features" 
              class="px-8 py-4 bg-white/10 dark:bg-white/5 backdrop-blur-md text-white dark:text-gray-100 rounded-xl font-semibold hover:bg-white/20 dark:hover:bg-white/10 transition border border-white/30 dark:border-white/20"
            >
              📖 Pelajari Lebih
            </a>
          </div>

          {/* Stats Preview */}
          <div class="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold">500+</div>
              <div class="text-sm text-gray-200 dark:text-gray-300">Anggota Aktif</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold">Rp 1M+</div>
              <div class="text-sm text-gray-200 dark:text-gray-300">Total Simpanan</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold">98%</div>
              <div class="text-sm text-gray-200 dark:text-gray-300">Kepuasan Anggota</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div class="w-6 h-10 border-2 border-white/50 dark:border-white/30 rounded-full flex justify-center pt-2">
          <div class="w-1 h-3 bg-white/50 dark:bg-white/30 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}