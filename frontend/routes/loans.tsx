/** @jsxImportSource preact */
import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx";
import LoansTable from "../islands/LoansTable.tsx";

export default function LoansPage() {
  return (
    <>
      <Head>
        <title>Manajemen Pinjaman - KSP ERP</title>
      </Head>
      
      <Layout>
        <div class="space-y-8">
          {/* Header */}
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Manajemen Pinjaman</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola pengajuan, approval, jadwal angsuran, dan pelunasan pinjaman anggota
            </p>
          </div>

          {/* Main Island Component */}
          <LoansTable />
        </div>
      </Layout>
    </>
  );
}