/** @jsxImportSource preact */
import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx";

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Pengaturan - KSP ERP</title>
      </Head>
      
      <Layout>
        <div class="space-y-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pengaturan</h1>
            <p class="text-gray-500 dark:text-gray-400">Kelola pengaturan sistem dan profil</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">👤</span>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Profil Akun</h2>
              </div>
              <p class="text-gray-500 dark:text-gray-400 mb-4">Kelola informasi profil dan password Anda</p>
              <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                Edit Profil
              </button>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">🎨</span>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Tampilan</h2>
              </div>
              <p class="text-gray-500 dark:text-gray-400 mb-4">Atur tema dan preferensi tampilan</p>
              <button class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                Pengaturan Tema
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}