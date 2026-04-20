/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";

const API_URL = "http://localhost:3000";

interface Member {
  id: string;
  memberNumber: string;
  fullName: string;
  phone: string;
}

interface Installment {
  id: number;
  installmentNumber: number;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  status: string;
}

interface Loan {
  id: number;
  loanNumber: string;
  memberId: string;
  member: {
    id: string;
    memberNumber: string;
    fullName: string;
    phone: string;
  };
  principal: string;
  interestRate: string;
  tenorMonths: number;
  totalAmount: string;
  remaining: string;
  status: string;
  approvedDate: string | null;
  installments: Installment[];
}

// Format Rupiah
function formatRupiah(amount: string | number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

// Format Date
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Format Phone untuk WhatsApp
function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return "62" + digits.substring(1);
  }
  if (digits.startsWith("62")) {
    return digits;
  }
  return digits.replace(/^\+/, "");
}

// HITUNG JATUH TEMPO - Fungsi baru!
function getInstallmentInfo(loan: Loan) {
  const unpaidInstallments = loan.installments.filter(inst => inst.status !== "paid");
  
  if (unpaidInstallments.length === 0) {
    return { nextDueDate: null, isOverdue: false, daysUntilDue: null, nextInstallmentNumber: null };
  }

  unpaidInstallments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  const next = unpaidInstallments[0];
  const today = new Date();
  const dueDate = new Date(next.dueDate);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    nextDueDate: dueDate,
    isOverdue: diffDays < 0,
    daysUntilDue: diffDays,
    nextInstallmentNumber: next.installmentNumber,
  };
}

// LABEL JATUH TEMPO - Fungsi baru!
function getDueDateLabel(days: number | null, isOverdue: boolean): { label: string; color: string } {
  if (days === null) return { label: "-", color: "text-gray-400" };
  
  if (isOverdue) {
    const daysOverdue = Math.abs(days);
    return { 
      label: `⚠️ ${daysOverdue} hari lalu`, 
      color: "text-red-600 dark:text-red-400 font-bold" 
    };
  }
  
  if (days === 0) return { label: "🔥 Hari ini!", color: "text-red-600 dark:text-red-400 font-bold" };
  if (days === 1) return { label: "🔥 Besok", color: "text-orange-600 dark:text-orange-400 font-bold" };
  if (days <= 3) return { label: `H-${days}`, color: "text-orange-600 dark:text-orange-400 font-semibold" };
  if (days <= 7) return { label: `H-${days}`, color: "text-yellow-600 dark:text-yellow-400" };
  
  return { label: formatDate(days.toString()), color: "text-gray-600 dark:text-gray-400" };
}

export default function LoansTable() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanToApprove, setLoanToApprove] = useState<number | null>(null);

  const [form, setForm] = useState({
    memberId: "",
    principal: "",
    interestRate: "12.00",
    tenorMonths: 12,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, membersRes] = await Promise.all([
        fetch(`${API_URL}/loans`),
        fetch(`${API_URL}/members`),
      ]);
      const loansJson = await loansRes.json();
      const membersJson = await membersRes.json();

      if (loansJson.success) setLoans(loansJson.data);
      if (membersJson.success) setMembers(membersJson.data);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLoans = loans.filter((loan) => {
    const matchSearch =
      loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.member.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus ? loan.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => setCurrentPage(1), [searchTerm, filterStatus]);

  const stats = {
    total: loans.length,
    pending: loans.filter((l) => l.status === "pending").length,
    active: loans.filter((l) => l.status === "approved").length,
    disbursed: loans.reduce((sum, l) => sum + Number(l.totalAmount), 0),
  };

  const handleCreateLoan = async (e: Event) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch(`${API_URL}/loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: form.memberId,
          principal: form.principal,
          interestRate: form.interestRate,
          tenorMonths: form.tenorMonths,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setShowCreateModal(false);
        setForm({ memberId: "", principal: "", interestRate: "12.00", tenorMonths: 12 });
        fetchData();
      } else {
        setFormError(json.error || "Gagal mengajukan pinjaman");
      }
    } catch (e) {
      setFormError("Terjadi kesalahan jaringan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleApproveClick = (loanId: number) => {
    setLoanToApprove(loanId);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!loanToApprove) return;

    setApproveLoading(true);
    try {
      const res = await fetch(`${API_URL}/loans/${loanToApprove}/approve`, {
        method: "PATCH",
      });
      const json = await res.json();

      if (json.success) {
        setShowApproveModal(false);
        fetchData();
      } else {
        alert("❌ " + (json.error || "Gagal approve"));
      }
    } catch (e) {
      alert("❌ Gagal menghubungi server");
    } finally {
      setApproveLoading(false);
    }
  };

  const handlePayInstallment = async (installmentId: number) => {
    if (!confirm("Tandai angsuran ini sebagai LUNAS?")) return;

    try {
      const res = await fetch(`${API_URL}/installments/${installmentId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paidDate: new Date().toISOString().split("T")[0] }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
        if (selectedLoan) {
          const updated = loans.find((l) => l.id === selectedLoan.id);
          if (updated) setSelectedLoan({ ...updated });
        }
      } else {
        alert(json.error || "Gagal mencatat pembayaran");
      }
    } catch (e) {
      alert("Gagal menghubungi server");
    }
  };

  // Send WhatsApp dengan context jatuh tempo
  const handleSendWA = async (loan: Loan, installmentInfo: ReturnType<typeof getInstallmentInfo>) => {
    const phone = formatWhatsAppPhone(loan.member.phone);
    const memberName = loan.member.fullName;
    const loanNumber = loan.loanNumber;
    
    let messageTemplate = "";
    
    if (installmentInfo.isOverdue) {
      const daysOverdue = Math.abs(installmentInfo.daysUntilDue!);
      messageTemplate = `
⚠️ *PEMBERITAHUAN TERLAMBAT*

Yth. ${memberName},

Angsuran pinjaman Anda telah **TERLAMBAT ${daysOverdue} hari**.

📋 No. Pinjaman: ${loanNumber}
💰 Sisa Pembayaran: ${formatRupiah(loan.remaining)}
📅 Jatuh Tempo: ${formatDate(installmentInfo.nextDueDate?.toISOString() || null)}
🔢 Angsuran Ke: ${installmentInfo.nextInstallmentNumber}

Mohon segera melakukan pembayaran.

Terima kasih,
💼 KSP ERP Magetan
      `.trim();
    } else if (installmentInfo.daysUntilDue! <= 3) {
      const daysLeft = installmentInfo.daysUntilDue;
      messageTemplate = `
🔔 *PENGINGAT PEMBAYARAN*

Halo ${memberName},

Angsuran Anda akan jatuh tempo dalam **${daysLeft} hari**.

📋 No. Pinjaman: ${loanNumber}
📅 Jatuh Tempo: ${formatDate(installmentInfo.nextDueDate?.toISOString() || null)}
🔢 Angsuran Ke: ${installmentInfo.nextInstallmentNumber}

Silakan lakukan pembayaran sebelum tanggal jatuh tempo.

Terima kasih,
💼 KSP ERP Magetan
      `.trim();
    } else {
      messageTemplate = `
🔔 *Pengingat Angsuran KSP Magetan*

Halo ${memberName},

📋 No: ${loanNumber}
💰 Sisa: ${formatRupiah(loan.remaining)}
📅 Jatuh Tempo: ${formatDate(installmentInfo.nextDueDate?.toISOString() || null)}
🔢 Angsuran Ke: ${installmentInfo.nextInstallmentNumber}

Silakan lakukan pembayaran sebelum tanggal jatuh tempo.

Terima kasih,
💼 KSP ERP Magetan
      `.trim();
    }

    try {
      const res = await fetch(`${API_URL}/api/send-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: messageTemplate }),
      });

      const result = await res.json();

      if (result.success || result.fallback) {
        if (result.fallback) {
          const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageTemplate)}`;
          window.open(waUrl, "_blank");
        }
        alert("✅ Notifikasi WhatsApp berhasil dikirim!");
      } else {
        alert("❌ Gagal kirim: " + (result.error || "Unknown error"));
      }
    } catch (e) {
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageTemplate)}`;
      window.open(waUrl, "_blank");
      alert("📱 Membuka WhatsApp Web...");
    }
  };

  return (
    <div class="space-y-6">
      {/* Stats Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Pinjaman" value={stats.total.toString()} icon="📑" color="blue" />
        <StatCard label="Menunggu Approval" value={stats.pending.toString()} icon="⏳" color="amber" />
        <StatCard label="Pinjaman Aktif" value={stats.active.toString()} icon="✅" color="green" />
        <StatCard label="Total Disalurkan" value={formatRupiah(stats.disbursed)} icon="💸" color="purple" />
      </div>

      {/* Main Table */}
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Toolbar */}
        <div class="p-6 border-b dark:border-gray-700 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Cari no. pinjaman atau nama anggota..."
                value={searchTerm}
                onInput={(e) => setSearchTerm(e.currentTarget.value)}
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.currentTarget.value)}
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="paid">Lunas</option>
              </select>

              <button
                onClick={() => setShowCreateModal(true)}
                class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition flex items-center gap-2 shadow-lg shadow-blue-500/30"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajukan Pinjaman
              </button>

              <button onClick={fetchData} class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition" title="Refresh">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div class="overflow-x-auto">
          {loading ? (
            <div class="p-12 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-500 dark:text-gray-400">Memuat data pinjaman...</p>
            </div>
          ) : paginatedLoans.length === 0 ? (
            <div class="p-12 text-center">
              <div class="text-6xl mb-4">📭</div>
              <p class="text-gray-500 dark:text-gray-400">Tidak ada data pinjaman yang sesuai.</p>
            </div>
          ) : (
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">No. Pinjaman</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Anggota</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Pokok</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Total</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden xl:table-cell">Sisa</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Jatuh Tempo</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedLoans.map((loan) => {
                  const installmentInfo = getInstallmentInfo(loan);
                  const dueDateLabel = getDueDateLabel(installmentInfo.daysUntilDue, installmentInfo.isOverdue);
                  
                  return (
                    <tr key={loan.id} class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600 dark:text-purple-400">
                        {loan.loanNumber}
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">{loan.member.fullName}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{loan.member.memberNumber}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100 hidden md:table-cell">
                        {formatRupiah(loan.principal)}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100 hidden lg:table-cell">
                        {formatRupiah(loan.totalAmount)}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-orange-600 dark:text-orange-400 hidden xl:table-cell">
                        {formatRupiah(loan.remaining)}
                      </td>
                      
                      {/* KOLOM JATUH TEMPO */}
                      <td class="px-6 py-4 whitespace-nowrap">
                        {installmentInfo.nextDueDate ? (
                          <div class="flex flex-col">
                            <span class={`text-sm ${dueDateLabel.color}`}>
                              {dueDateLabel.label}
                            </span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">
                              Angsuran ke-{installmentInfo.nextInstallmentNumber}
                            </span>
                            {installmentInfo.isOverdue && (
                              <span class="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                                ⚠️ Terlambat!
                              </span>
                            )}
                          </div>
                        ) : (
                          <span class="text-sm text-green-600 dark:text-green-400 font-medium">
                            ✅ Lunas
                          </span>
                        )}
                      </td>
                      
                      <td class="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={loan.status} />
                      </td>
                      
                      <td class="px-6 py-4 whitespace-nowrap text-right">
                        <div class="flex items-center justify-end gap-2">
                          {loan.status === "pending" && (
                            <button
                              onClick={() => handleApproveClick(loan.id)}
                              class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-green-500/30"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Approve
                            </button>
                          )}
                          
                          {/* WhatsApp Button - Contextual */}
                          {loan.status === "approved" && installmentInfo.nextDueDate && (
                            <button
                              onClick={() => handleSendWA(loan, installmentInfo)}
                              class={`px-3 py-2 text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
                                installmentInfo.isOverdue
                                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                                  : installmentInfo.daysUntilDue! <= 3
                                  ? "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30"
                                  : "bg-green-500 hover:bg-green-600"
                              }`}
                              title="Kirim reminder WhatsApp"
                            >
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              {installmentInfo.isOverdue ? "WA Overdue" : installmentInfo.daysUntilDue! <= 3 ? "WA Urgent" : "WA"}
                            </button>
                          )}
                          
                          <button
                            onClick={() => { setSelectedLoan(loan); setShowInstallmentsModal(true); }}
                            class="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                          >
                            📅 Angsuran
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div class="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredLoans.length)} dari {filteredLoans.length} data
            </p>
            <div class="flex gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">
                ←
              </button>
              <span class="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
                Hal {currentPage}/{totalPages}
              </span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE LOAN MODAL */}
      {showCreateModal && (
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={() => setShowCreateModal(false)}></div>
            <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Ajukan Pinjaman Baru</h3>
                {formError && <div class="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">{formError}</div>}
                <form onSubmit={handleCreateLoan} class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Anggota *</label>
                    <select
                      required
                      value={form.memberId}
                      onChange={(e) => setForm({ ...form, memberId: e.currentTarget.value })}
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">-- Pilih Anggota --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} ({m.memberNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pokok Pinjaman (Rp) *</label>
                    <input
                      type="number"
                      required
                      min="100000"
                      step="1000"
                      value={form.principal}
                      onChange={(e) => setForm({ ...form, principal: e.currentTarget.value })}
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="1000000"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bunga (%/thn)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.interestRate}
                        onChange={(e) => setForm({ ...form, interestRate: e.currentTarget.value })}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenor (Bulan)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="60"
                        value={form.tenorMonths}
                        onChange={(e) => setForm({ ...form, tenorMonths: Number(e.currentTarget.value) })}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <div class="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={formLoading}
                      class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      {formLoading ? "Memproses..." : "Ajukan Pinjaman"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSTALLMENTS MODAL */}
      {showInstallmentsModal && selectedLoan && (
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={() => setShowInstallmentsModal(false)}></div>
            <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
              <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Jadwal Angsuran</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {selectedLoan.loanNumber} • {selectedLoan.member.fullName}
                    </p>
                  </div>
                  <StatusBadge status={selectedLoan.status} />
                </div>

                <div class="overflow-x-auto max-h-96 overflow-y-auto border dark:border-gray-700 rounded-lg">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                      <tr>
                        <th class="px-4 py-3 text-left">Ke-</th>
                        <th class="px-4 py-3 text-left">Jatuh Tempo</th>
                        <th class="px-4 py-3 text-right">Nominal</th>
                        <th class="px-4 py-3 text-center">Status</th>
                        <th class="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedLoan.installments.map((inst) => (
                        <tr key={inst.id} class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td class="px-4 py-3 font-medium">{inst.installmentNumber}</td>
                          <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(inst.dueDate)}</td>
                          <td class="px-4 py-3 text-right font-medium">{formatRupiah(inst.amount)}</td>
                          <td class="px-4 py-3 text-center">
                            <span
                              class={`px-2 py-1 text-xs rounded-full ${
                                inst.status === "paid"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                              }`}
                            >
                              {inst.status === "paid" ? "✅ Lunas" : "⏳ Belum"}
                            </span>
                          </td>
                          <td class="px-4 py-3 text-right">
                            {inst.status !== "paid" && selectedLoan.status === "approved" ? (
                              <button
                                onClick={() => handlePayInstallment(inst.id)}
                                class="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                              >
                                Bayar
                              </button>
                            ) : (
                              <span class="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div class="flex justify-end mt-4">
                  <button
                    onClick={() => setShowInstallmentsModal(false)}
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL MODAL */}
      {showApproveModal && loans.find((l) => l.id === loanToApprove) && (
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 dark:bg-opacity-75 backdrop-blur-sm"
              onClick={() => setShowApproveModal(false)}
            ></div>

            <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-200 dark:border-gray-700">
              <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-white/20 rounded-lg">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold text-white">Setujui Pinjaman?</h3>
                  </div>
                  <button onClick={() => setShowApproveModal(false)} class="text-white/80 hover:text-white transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="px-6 py-6">
                {(() => {
                  const loan = loans.find((l) => l.id === loanToApprove);
                  if (!loan) return null;
                  return (
                    <>
                      <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                        <div class="flex items-start gap-3">
                          <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <p class="text-sm font-medium text-amber-900 dark:text-amber-300">Konfirmasi Approval</p>
                            <p class="text-sm text-amber-700 dark:text-amber-400 mt-1">
                              Tindakan ini akan mengaktifkan jadwal angsuran dan mengirim notifikasi ke anggota.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                        <div class="space-y-2 text-sm">
                          <div class="flex justify-between">
                            <span class="text-gray-500 dark:text-gray-400">No. Pinjaman</span>
                            <span class="font-medium text-gray-900 dark:text-white">{loan.loanNumber}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-500 dark:text-gray-400">Anggota</span>
                            <span class="font-medium text-gray-900 dark:text-white">{loan.member.fullName}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-500 dark:text-gray-400">Total Pinjaman</span>
                            <span class="font-medium text-green-600">{formatRupiah(loan.totalAmount)}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-500 dark:text-gray-400">Tenor</span>
                            <span class="font-medium text-gray-900 dark:text-white">{loan.tenorMonths} bulan</span>
                          </div>
                        </div>
                      </div>

                      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>Setelah disetujui:</p>
                        <ul class="space-y-2 ml-4">
                          <li class="flex items-center gap-2">
                            <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Jadwal angsuran dibuat otomatis
                          </li>
                          <li class="flex items-center gap-2">
                            <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Anggota mendapat notifikasi WhatsApp
                          </li>
                          <li class="flex items-center gap-2">
                            <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Status berubah menjadi "Aktif"
                          </li>
                        </ul>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  disabled={approveLoading}
                  class="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={approveLoading}
                  class="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition font-medium shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {approveLoading ? (
                    <>
                      <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Ya, Setujui
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400",
    amber: "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400",
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

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    approved: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    paid: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  };
  const labels = {
    pending: "⏳ Menunggu",
    approved: "🟡 Aktif",
    paid: "✅ Lunas",
    rejected: "❌ Ditolak",
  };
  return (
    <span class={`px-3 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}