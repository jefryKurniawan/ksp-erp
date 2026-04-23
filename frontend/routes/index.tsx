/** @jsxImportSource preact */
import { Head } from "$fresh/runtime.ts";
import LandingHero from "../islands/LandingHero.tsx";
import LandingFeatures from "../islands/LandingFeatures.tsx";
import LandingStats from "../islands/LandingStats.tsx";
import LandingTestimonials from "../islands/LandingTestimonials.tsx";
import LandingCTA from "../islands/LandingCTA.tsx";
import ThemeToggle from "../islands/ThemeToggle.tsx";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>KSP ERP - Sistem Manajemen Koperasi Modern</title>
        <meta name="description" content="Sistem ERP Koperasi Simpan Pinjaman modern untuk pengelolaan anggota, simpanan, dan pinjaman yang efisien" />
      </Head>
      
      <div class="bg-white dark:bg-gray-900 transition-colors duration-200">
        {/* Navigation dengan Dark Mode Toggle */}
        <nav class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md fixed w-full z-50 border-b dark:border-gray-800 transition-colors">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🏦</span>
                <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  KSP ERP
                </span>
              </div>
              <div class="flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <ThemeToggle />
                
                <a href="/login" class="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition">
                  Login
                </a>
                {/* <a href="/dashboard" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                  Dashboard
                </a> */}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section dengan Parallax */}
        <LandingHero />

        {/* Features Section */}
        <LandingFeatures />

        {/* Stats Section dengan Parallax Background */}
        <LandingStats />

        {/* Testimonials */}
        <LandingTestimonials />

        {/* CTA Section */}
        <LandingCTA />

        {/* Footer */}
        <footer class="bg-gray-900 dark:bg-gray-950 text-gray-300 py-12 transition-colors">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 class="text-lg font-bold text-white mb-4">KSP ERP Magetan</h3>
                <p class="text-sm text-gray-400">
                  Sistem manajemen koperasi modern untuk pengelolaan yang lebih efisien dan transparan.
                </p>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white mb-4">Fitur Utama</h3>
                <ul class="space-y-2 text-sm text-gray-400">
                  <li>• Manajemen Anggota</li>
                  <li>• Simpanan & Pinjaman</li>
                  <li>• Laporan Real-time</li>
                  <li>• Sistem Angsuran Otomatis</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white mb-4">Kontak</h3>
                <ul class="space-y-2 text-sm text-gray-400">
                  <li>📍 Magetan, Jawa Timur</li>
                  <li>📧 info@ksp-magetan.id</li>
                  <li>📞 (0351) 123456</li>
                </ul>
              </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
              <p>© 2026 Koperasi Simpan Pinjaman Magetan. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}