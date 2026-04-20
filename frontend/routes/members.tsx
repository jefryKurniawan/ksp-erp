/** @jsxImportSource preact */
import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx";
import MembersTable from "../islands/MembersTable.tsx";

export default function MembersPage() {
  return (
    <>
      <Head>
        <title>Manajemen Anggota - KSP ERP</title>
      </Head>
      
      <Layout>
        <div class="space-y-8">
          
          {/* Page Header - Clean & Modern */}
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Manajemen Anggota</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola data anggota koperasi secara efisien</p>
          </div>

          {/* Stats Grid - More spacious */}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Anggota" value="1" icon="👥" color="blue" />
            <StatCard label="Anggota Aktif" value="1" icon="✅" color="green" />
            <StatCard label="Anggota Baru (Bulan Ini)" value="1" icon="🆕" color="purple" />
            <StatCard label="Total Simpanan" value="Rp 450K" icon="💰" color="amber" />
          </div>

          {/* Main Content Area */}
          <MembersTable />
          
        </div>
      </Layout>
    </>
  );
}

// Helper Component untuk Stat Card agar kode lebih bersih
function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div class={`p-3 rounded-lg ${colors[color as keyof typeof colors]}`}>
          <span class="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}