/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";
import DashboardStats from "./DashboardStats.tsx";
import { auth } from "../utils/auth.ts";

export default function DashboardContent() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = auth.getUser();
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }
    setUser(currentUser);
  }, []);

  if (!user) {
    return (
      <div class="flex items-center justify-center min-h-[60vh]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickActions = [
    {
      href: "/members",
      icon: "👥",
      title: "Kelola Anggota",
      desc: "Tambah, edit, lihat daftar anggota",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
    },
    {
      href: "/loans",
      icon: "💰",
      title: "Pinjaman",
      desc: "Approve, bayar angsuran, monitoring",
      color: "from-emerald-500 to-emerald-600",
      hoverColor: "hover:from-emerald-600 hover:to-emerald-700",
    },
    {
      href: "/reports",
      icon: "📊",
      title: "Laporan",
      desc: "Export PDF, rekap simpanan & pinjaman",
      color: "from-violet-500 to-violet-600",
      hoverColor: "hover:from-violet-600 hover:to-violet-700",
    },
  ];

  return (
    <div class="space-y-8">
      {/* Welcome Section */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Selamat Datang, {user.name}!
          </h1>
          <p class="text-gray-500 dark:text-gray-400">
            {user.role === "owner" ? "👑 Panel Owner" : "👤 Panel Karyawan"} • {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
          <span class={`w-2 h-2 rounded-full ${user.role === "owner" ? "bg-purple-500" : "bg-blue-500"} animate-pulse`}></span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
            {user.role === "owner" ? "Akses Penuh" : "Akses Terbatas"}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Quick Actions - Cleaner Grid */}
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Akses Cepat</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              class={`group block p-6 bg-gradient-to-br ${action.color} ${action.hoverColor} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-white`}
            >
              <div class="flex items-start gap-4">
                <span class="text-4xl transform group-hover:scale-110 transition-transform">{action.icon}</span>
                <div class="flex-1">
                  <h3 class="font-bold text-lg mb-1">{action.title}</h3>
                  <p class="text-white/80 text-sm">{action.desc}</p>
                </div>
                <svg class="w-6 h-6 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Owner Panel */}
      {user.role === "owner" && (
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
          <div class="flex items-start gap-3">
            <span class="text-3xl">👑</span>
            <div class="flex-1">
              <h3 class="font-bold text-amber-900 dark:text-amber-300 mb-2">Panel Owner - Fitur Khusus</h3>
              <p class="text-sm text-amber-800 dark:text-amber-400 mb-3">
                Akses penuh ke semua fitur: approval pinjaman besar, laporan keuangan lengkap, manajemen user, dan pengaturan sistem.
              </p>
              <div class="flex gap-2">
                <span class="px-3 py-1 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 rounded-full text-xs font-medium">
                  Approval Pinjaman
                </span>
                <span class="px-3 py-1 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 rounded-full text-xs font-medium">
                  Laporan Keuangan
                </span>
                <span class="px-3 py-1 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 rounded-full text-xs font-medium">
                  User Management
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity - Cleaner */}
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Aktivitas Terbaru</h3>
          <button class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            Lihat Semua
          </button>
        </div>
        <div class="space-y-3">
          {[
            { icon: "🟢", color: "bg-green-500", text: "Anggota baru: Budi Santoso (KSP-2026-681)", time: "2 menit lalu" },
            { icon: "🔵", color: "bg-blue-500", text: "Pinjaman disetujui: PJM-2026-820", time: "5 menit lalu" },
            { icon: "🟡", color: "bg-yellow-500", text: "Angsuran dibayar: #1 dari PJM-2026-820", time: "10 menit lalu" },
          ].map((activity, idx) => (
            <div key={idx} class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <span class={`w-2 h-2 rounded-full ${activity.color} flex-shrink-0`}></span>
              <span class="flex-1 text-gray-700 dark:text-gray-300">{activity.text}</span>
              <span class="text-sm text-gray-400 dark:text-gray-500 flex-shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}