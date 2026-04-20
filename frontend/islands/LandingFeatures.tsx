/** @jsxImportSource preact */
export default function LandingFeatures() {
  const features = [
    {
      icon: "👥",
      title: "Manajemen Anggota",
      description: "Kelola data anggota dengan mudah, dari pendaftaran hingga monitoring aktivitas",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "💾",
      title: "Simpanan Otomatis",
      description: "Sistem pencatatan simpanan pokok, wajib, dan sukarela yang terintegrasi",
      color: "from-green-500 to-green-600",
    },
    {
      icon: "💰",
      title: "Pinjaman & Angsuran",
      description: "Pengajuan pinjaman dengan perhitungan bunga otomatis dan jadwal angsuran",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: "📊",
      title: "Laporan Real-time",
      description: "Dashboard dan laporan keuangan yang update secara real-time",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: "🔒",
      title: "Keamanan Data",
      description: "Data tersimpan aman dengan enkripsi dan backup otomatis",
      color: "from-red-500 to-red-600",
    },
    {
      icon: "📱",
      title: "Akses Multi-Device",
      description: "Akses dari desktop, tablet, atau smartphone kapan saja",
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <section id="features" class="py-24 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Fitur Lengkap untuk Koperasi Anda
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola koperasi dalam satu platform terintegrasi
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              class="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div class={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}