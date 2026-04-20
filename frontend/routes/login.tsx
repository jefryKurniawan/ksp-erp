/** @jsxImportSource preact */
import { Head } from "$fresh/runtime.ts";
import LoginForm from "../islands/LoginForm.tsx";
import ThemeToggle from "../islands/ThemeToggle.tsx";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - KSP ERP</title>
        <meta name="description" content="Masuk ke sistem KSP ERP untuk mengelola koperasi" />
      </Head>
      
      <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 relative overflow-hidden">
        {/* Background Decorations */}
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
          <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "4s" }}></div>
        </div>

        {/* Theme Toggle */}
        <div class="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Main Card */}
        <div class="relative w-full max-w-md">
          {/* Logo & Title */}
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform">
              <span class="text-3xl">🏦</span>
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              KSP ERP
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              Selamat datang kembali! Silakan masuk untuk melanjutkan.
            </p>
          </div>

          {/* Login Form Card */}
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 transform hover:scale-[1.01] transition-all duration-300">
            <LoginForm />
          </div>

          {/* Footer Text */}
          <p class="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 KSP ERP Magetan. All rights reserved.
            <br />
            <span class="text-xs">Sistem Manajemen Koperasi Modern</span>
          </p>
        </div>
      </div>
    </>
  );
}