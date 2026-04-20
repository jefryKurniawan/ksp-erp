/** @jsxImportSource preact */
export default function LandingTestimonials() {
  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Ketua Koperasi",
      content: "Sistem ini sangat membantu dalam pengelolaan koperasi kami. Laporan bisa diakses real-time dan anggota lebih puas dengan pelayanan.",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      name: "Siti Aminah",
      role: "Bendahara",
      content: "Pencatatan simpanan dan pinjaman jadi sangat mudah. Tidak perlu lagi buku besar manual. Hemat waktu dan lebih akurat.",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      name: "Ahmad Fauzi",
      role: "Anggota",
      content: "Saya bisa cek saldo simpanan dan sisa pinjaman kapan saja. Proses pengajuan pinjaman juga lebih cepat dan transparan.",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  ];

  return (
    <section class="py-24 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Apa Kata Mereka?
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Testimoni dari pengguna KSP ERP
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 relative"
            >
              <div class="text-6xl text-blue-200 dark:text-blue-900 absolute top-4 left-4">"</div>
              <p class="text-gray-700 dark:text-gray-300 mb-6 relative z-10 pt-8">
                {testimonial.content}
              </p>
              <div class="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  class="w-12 h-12 rounded-full"
                />
                <div>
                  <div class="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}