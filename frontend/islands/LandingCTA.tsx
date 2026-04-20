/** @jsxImportSource preact */
export default function LandingCTA() {
  return (
    <section class="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">
          Siap Mengelola Koperasi Lebih Baik?
        </h2>
        <p class="text-xl text-gray-100 mb-8">
          Bergabunglah dengan ratusan koperasi yang telah menggunakan KSP ERP
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/dashboard" 
            class="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-2xl"
          >
            🎯 Mulai Gratis Sekarang
          </a>
          <a 
            href="/login" 
            class="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold hover:bg-white/20 transition border border-white/30"
          >
            👤 Sudah Punya Akun? Login
          </a>
        </div>
        <p class="text-sm text-gray-200 mt-6">
          ✅ Gratis 14 hari pertama • ✅ Tanpa kartu kredit • ✅ Cancel kapan saja
        </p>
      </div>
    </section>
  );
}