/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";

const API_URL = "http://localhost:3000";

interface DashboardData {
  totalAnggotaAktif: number;
  totalSimpanan: number;
  totalPinjamanDistribusi: number;
  totalSisaPinjaman: number;
  totalPinjamanLunas: number;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/reports/dashboard`);
      const json = await res.json();
      if (json.success) setData(json.data);
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      label: "Anggota Aktif",
      value: data?.totalAnggotaAktif || 0,
      icon: "👥",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconBg: "bg-blue-100 dark:bg-blue-800",
    },
    {
      label: "Total Simpanan",
      value: formatRupiah(data?.totalSimpanan || 0),
      icon: "💾",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      iconBg: "bg-emerald-100 dark:bg-emerald-800",
    },
    {
      label: "Pinjaman Diberikan",
      value: formatRupiah(data?.totalPinjamanDistribusi || 0),
      icon: "📤",
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50 dark:bg-violet-900/20",
      iconBg: "bg-violet-100 dark:bg-violet-800",
    },
    {
      label: "Sisa Pinjaman",
      value: formatRupiah(data?.totalSisaPinjaman || 0),
      icon: "📥",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      iconBg: "bg-orange-100 dark:bg-orange-800",
    },
  ];

  if (loading && !data) {
    return (
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} class="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} class={`${stat.bgColor} rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow`}>
            <div class="flex items-start justify-between mb-4">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div class={`${stat.iconBg} p-3 rounded-xl`}>
                <span class="text-2xl">{stat.icon}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span class={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}></span>
              <span>Real-time</span>
            </div>
          </div>
        ))}
      </div>
      
      {lastUpdate && (
        <div class="flex items-center justify-end mt-4 text-xs text-gray-400">
          <span>Terakhir update: {lastUpdate.toLocaleTimeString("id-ID")}</span>
          <button onClick={fetchData} class="ml-3 text-blue-600 hover:text-blue-700 dark:text-blue-400">
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
}