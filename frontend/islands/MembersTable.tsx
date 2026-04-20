/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";

const API_URL = "http://localhost:3000";

interface Member {
  id: string;
  memberNumber: string;
  fullName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  idCard?: string;
  status: string;
  joinedDate: string;
}

export default function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  const ITEMS_PER_PAGE = 10;

  // Fetch members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/members`);
      const json = await res.json();
      if (json.success) setMembers(json.data);
    } catch (e) {
      console.error("Failed to fetch members:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Filter & Search
  const filteredMembers = members.filter(member => {
    const matchSearch = 
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    
    const matchCity = filterCity ? member.city === filterCity : true;
    const matchStatus = filterStatus ? member.status === filterStatus : true;
    
    return matchSearch && matchCity && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCity, filterStatus]);

  // Get unique cities for filter
  const cities = [...new Set(members.map(m => m.city))];

  return (
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Toolbar */}
      <div class="p-6 border-b dark:border-gray-700 space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input
                type="text"
                placeholder="Cari nama, no. anggota, atau telepon..."
                value={searchTerm}
                onInput={(e) => setSearchTerm(e.currentTarget.value)}
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters & Actions */}
          <div class="flex flex-wrap items-center gap-3">
            {/* Filter Kota */}
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.currentTarget.value)}
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Semua Kota</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.currentTarget.value)}
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            {/* Tombol Tambah */}
            <button
              onClick={() => {
                setEditingMember(null);
                setShowModal(true);
              }}
              class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Anggota
            </button>

            {/* Refresh */}
            <button
              onClick={fetchMembers}
              class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              title="Refresh data"
            >
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Active Filters Info */}
        {(searchTerm || filterCity || filterStatus) && (
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Menampilkan {filteredMembers.length} dari {members.length} anggota</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCity("");
                setFilterStatus("");
              }}
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div class="overflow-x-auto">
        {loading ? (
          <div class="p-12 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-500 dark:text-gray-400">Memuat data...</p>
          </div>
        ) : paginatedMembers.length === 0 ? (
          <div class="p-12 text-center">
            <div class="text-6xl mb-4">📭</div>
            <p class="text-gray-500 dark:text-gray-400">
              {searchTerm || filterCity || filterStatus 
                ? "Tidak ada data yang sesuai dengan filter."
                : "Belum ada data anggota."}
            </p>
          </div>
        ) : (
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No. Anggota</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Kontak</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Kota</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedMembers.map((member) => (
                <tr key={member.id} class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium text-blue-600 dark:text-blue-400">{member.memberNumber}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{member.fullName}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400 md:hidden">{member.phone}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div class="text-sm text-gray-900 dark:text-gray-100">{member.phone}</div>
                    {member.email && <div class="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <span class="text-sm text-gray-900 dark:text-gray-100">{member.city}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class={`px-3 py-1 text-xs font-medium rounded-full ${
                      member.status === "active"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400"
                    }`}>
                      {member.status === "active" ? "✅ Aktif" : "⏸ Nonaktif"}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        setEditingMember(member);
                        setShowModal(true);
                      }}
                      class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div class="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} dari {filteredMembers.length} data
          </p>
          <div class="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
            >
              ← Sebelumnya
            </button>
            <span class="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}

      {/* Modal Form - Akan saya buat di file terpisah */}
      {showModal && (
        <MemberModal
          member={editingMember}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchMembers();
          }}
        />
      )}
    </div>
  );
}

// Member Modal Component
function MemberModal({ member, onClose, onSuccess }: { member: Member | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    fullName: member?.fullName || "",
    email: member?.email || "",
    phone: member?.phone || "",
    address: member?.address || "",
    city: member?.city || "Magetan",
    idCard: member?.idCard || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (member) {
        // Update member (API belum ada, simulasi saja)
        alert("Fitur update akan segera hadir!");
      } else {
        // Create member
        const res = await fetch(`${API_URL}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          onSuccess();
        } else {
          setError(json.error || "Gagal menambah anggota");
        }
      }
    } catch (e) {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={onClose}></div>

        {/* Modal Content */}
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {member ? "Edit Anggota" : "Tambah Anggota Baru"}
            </h3>
            
            {error && (
              <div class="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onInput={(e) => setFormData({ ...formData, fullName: e.currentTarget.value })}
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onInput={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="budi@example.com"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. Telepon *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onInput={(e) => setFormData({ ...formData, phone: e.currentTarget.value })}
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="081234567890"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kota</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.currentTarget.value })}
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="Magetan">Magetan</option>
                  <option value="Madiun">Madiun</option>
                  <option value="Ngawi">Ngawi</option>
                  <option value="Ponorogo">Ponorogo</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onInput={(e) => setFormData({ ...formData, address: e.currentTarget.value })}
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Jl. Raya Magetan No. 10"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIK (Opsional)</label>
                <input
                  type="text"
                  value={formData.idCard}
                  onInput={(e) => setFormData({ ...formData, idCard: e.currentTarget.value })}
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="3520011234567890"
                />
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : member ? "Update" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
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
  );
}