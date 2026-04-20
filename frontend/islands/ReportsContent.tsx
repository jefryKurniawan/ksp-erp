/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";

const API_URL = "http://localhost:3000";

interface SavingsReport {
  memberNumber: string;
  fullName: string;
  city: string;
  simpananPokok: number;
  simpananWajib: number;
  simpananSukarela: number;
  totalSimpanan: number;
}

interface LoanReport {
  loanNumber: string;
  memberNumber: string;
  memberName: string;
  pokokPinjaman: number;
  bunga: number;
  tenor: number;
  totalPinjaman: number;
  sisaPinjaman: number;
  status: string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ReportsContent() {
  const [activeTab, setActiveTab] = useState<"savings" | "loans" | "dashboard">("dashboard");
  const [savingsData, setSavingsData] = useState<SavingsReport[]>([]);
  const [loansData, setLoansData] = useState<LoanReport[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [savingsRes, loansRes, dashboardRes] = await Promise.all([
        fetch(`${API_URL}/reports/savings-summary`),
        fetch(`${API_URL}/reports/loans-active`),
        fetch(`${API_URL}/reports/dashboard`),
      ]);

      const savingsJson = await savingsRes.json();
      const loansJson = await loansRes.json();
      const dashboardJson = await dashboardRes.json();

      if (savingsJson.success) setSavingsData(savingsJson.data);
      if (loansJson.success) setLoansData(loansJson.data);
      if (dashboardJson.success) setDashboardData(dashboardJson.data);
      
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    } finally {
      setLoading(false);
    }
  };

  // Filter data berdasarkan search
  const filteredSavings = savingsData.filter(item => 
    item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.memberNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSavings.length / ITEMS_PER_PAGE);
  const paginatedSavings = filteredSavings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page saat search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Export to CSV
  const exportToCSV = (data: any[], filename: string, columns: {key: string; label: string}[]) => {
    const header = columns.map(c => c.label).join(",");
    const rows = data.map(row => 
      columns.map(c => {
        const value = row[c.key];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleExportSavings = () => {
    const columns = [
      { key: "memberNumber", label: "No. Anggota" },
      { key: "fullName", label: "Nama Lengkap" },
      { key: "city", label: "Kota" },
      { key: "simpananPokok", label: "Simpanan Pokok (Rp)" },
      { key: "simpananWajib", label: "Simpanan Wajib (Rp)" },
      { key: "simpananSukarela", label: "Simpanan Sukarela (Rp)" },
      { key: "totalSimpanan", label: "Total Simpanan (Rp)" },
    ];
    exportToCSV(filteredSavings, "laporan_simpanan_ksp", columns);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-300">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header dengan Search & Export */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Laporan KSP</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Rekap simpanan, pinjaman, dan statistik</p>
        </div>
        
        <div class="flex items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Cari nama/no. anggota..."
            value={searchTerm}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          
          {/* Export Button */}
          <button
            onClick={handleExportSavings}
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2 text-sm"
            title="Export ke CSV (Excel-compatible)"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex gap-4" aria-label="Tabs">
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "savings", label: "💾 Simpanan" },
            { id: "loans", label: "💰 Pinjaman" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              class={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && dashboardData && (
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500 transition-colors">
              <p class="text-sm text-gray-500 dark:text-gray-400">Anggota Aktif</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{dashboardData.totalAnggotaAktif}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500 transition-colors">
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Simpanan</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatRupiah(dashboardData.totalSimpanan)}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500 transition-colors">
              <p class="text-sm text-gray-500 dark:text-gray-400">Pinjaman Diberikan</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatRupiah(dashboardData.totalPinjamanDistribusi)}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-orange-500 transition-colors">
              <p class="text-sm text-gray-500 dark:text-gray-400">Sisa Pinjaman</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatRupiah(dashboardData.totalSisaPinjaman)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Savings Tab - DENGAN PAGINATION & SEARCH */}
      {activeTab === "savings" && (
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
          <div class="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">
              Rekap Simpanan Anggota ({filteredSavings.length} data)
            </h3>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                ✕ Clear search
              </button>
            )}
          </div>
          
          {filteredSavings.length === 0 ? (
            <p class="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? "Tidak ada hasil pencarian." : "Belum ada data simpanan."}
            </p>
          ) : (
            <>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">No. Anggota</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Kota</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {/* ✅ PENTING: Pakai paginatedSavings, bukan savingsData */}
                    {paginatedSavings.map((item) => (
                      <tr key={item.memberNumber} class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                          {item.memberNumber}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {item.fullName}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                          {item.city}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600 dark:text-green-400">
                          {formatRupiah(item.totalSimpanan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div class="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/30">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredSavings.length)} dari {filteredSavings.length} data
                  </p>
                  <div class="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
                    >
                      ← Sebelumnya
                    </button>
                    <span class="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
                    >
                      Selanjutnya →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === "loans" && (
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
          <div class="p-4 border-b dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Rekap Pinjaman Aktif</h3>
          </div>
          
          {loansData.length === 0 ? (
            <p class="p-8 text-center text-gray-500 dark:text-gray-400">Belum ada pinjaman aktif.</p>
          ) : (
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">No. Pinjaman</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Anggota</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sisa</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loansData.map((item) => (
                    <tr key={item.loanNumber} class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600 dark:text-purple-400">
                        {item.loanNumber}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <p class="text-sm text-gray-900 dark:text-gray-100">{item.memberName}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{item.memberNumber}</p>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                        {formatRupiah(item.totalPinjaman)}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-orange-600 dark:text-orange-400">
                        {formatRupiah(item.sisaPinjaman)}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class={`px-2 py-1 text-xs rounded-full ${
                          item.status === "approved" 
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" 
                            : item.status === "paid"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}>
                          {item.status === "approved" ? "🟡 Aktif" : item.status === "paid" ? "✅ Lunas" : "⏳ Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}