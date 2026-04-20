/** @jsxImportSource preact */
import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx";

export default function SavingsPage() {
  return (
    <>
      <Head>
        <title>Simpanan - KSP ERP</title>
      </Head>
      
      <Layout>
        <div class="space-y-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manajemen Simpanan</h1>
            <p class="text-gray-500 dark:text-gray-400">Kelola simpanan pokok, wajib, dan sukarela anggota</p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div class="text-6xl mb-4">💾</div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fitur Simpanan</h2>
            <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Halaman ini sedang dalam pengembangan. Fitur akan mencakup:
            </p>
            <ul class="mt-6 space-y-2 text-left max-w-md mx-auto">
              {[
                "Catat simpanan pokok anggota baru",
                "Setor simpanan wajib bulanan",
                "Simpanan sukarela",
                "Histori transaksi simpanan",
                "Export laporan simpanan"
              ].map((item, idx) => (
                <li key={idx} class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Layout>
    </>
  );
}