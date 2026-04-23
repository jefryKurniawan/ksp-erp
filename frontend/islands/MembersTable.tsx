/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";
import MemberForm from "./MemberForm.tsx";

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
  offline?: boolean;
}

export default function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showModal, setShowModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  
  const ITEMS_PER_PAGE = 10;

  const getOfflineMembers = async (): Promise<Member[]> => {
    console.log('🔍 getOfflineMembers called');
  
    try {
      return new Promise((resolve) => {
        const request = indexedDB.open('ksp-offline-db', 1);
        
        request.onerror = () => {
          console.error('❌ IndexedDB open error');
          resolve([]);
        };
        
        request.onsuccess = () => {
          const db = request.result;
          
          if (!db.objectStoreNames.contains('sync_queue')) {
            console.warn('⚠️ sync_queue store not found');
            resolve([]);
            return;
          }
          
          const tx = db.transaction(['sync_queue'], 'readonly');
          const store = tx.objectStore('sync_queue');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const allItems = getAllRequest.result;
            console.log('📦 Total items in sync_queue:', allItems.length);
            
            // ✅ FIX: Filter yang lebih longgar
            const offlineMembers = allItems
              .filter((item: any) => {
                // Cek endpoint mengandung 'members' DAN method POST
                const isMembersEndpoint = item.endpoint && 
                  (item.endpoint.includes('/members') || item.endpoint.includes('members'));
                const isCreateOperation = item.method === 'POST';
                const isPendingStatus = item.status === 'pending';
                
                console.log('Checking item:', {
                  endpoint: item.endpoint,
                  isMembersEndpoint,
                  method: item.method,
                  isCreateOperation,
                  status: item.status,
                  isPendingStatus,
                  willInclude: isMembersEndpoint && isCreateOperation && isPendingStatus
                });
                
                return isMembersEndpoint && isCreateOperation && isPendingStatus;
              })
              .map((item: any, index: number) => {
                console.log('Mapping offline member:', item.body);
                
                return {
                  id: `offline-${item.timestamp || Date.now()}-${index}`,
                  memberNumber: `OFFLINE-${String(index + 1).padStart(3, '0')}`,
                  fullName: item.body?.fullName || 'Unknown',
                  email: item.body?.email || '',
                  phone: item.body?.phone || '',
                  address: item.body?.address || '',
                  city: item.body?.city || 'Magetan',
                  idCard: item.body?.idCard || '',
                  status: item.body?.status || 'active',
                  offline: true,
                  joinedDate: new Date(item.timestamp || Date.now()).toISOString(),
                };
              });
            
            console.log(`✅ Mapped ${offlineMembers.length} offline members`);
            console.log('Offline members:', offlineMembers);
            resolve(offlineMembers);
          };
          
          getAllRequest.onerror = () => {
            console.error('❌ Failed to get items');
            resolve([]);
          };
        };
      });
    } catch (error) {
      console.error('❌ Error in getOfflineMembers:', error);
      return [];
    }
  };

  // ✅ FIX: fetchMembers yang lebih robust
  const fetchMembers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching members...');
      
      // Always try to get offline data first
      const offlineData = await getOfflineMembers();
      console.log('📦 Offline data count:', offlineData.length);
      
      // Try to fetch from API
      try {
        const res = await fetch(`${API_URL}/members`, { 
          cache: 'no-store',
          headers: { 'Accept': 'application/json' }
        });
        const json = await res.json();
        
        if (json.success) {
          console.log('✅ Online members:', json.data.length);
          // Merge: online data + offline pending data
          const merged = [...json.data, ...offlineData];
          console.log('📋 Total members (merged):', merged.length);
          setMembers(merged);
        } else {
          console.warn('⚠️ API returned error, using offline only');
          setMembers(offlineData);
        }
      } catch (networkError) {
        console.log('🌐 Offline mode - using IndexedDB data only');
        setMembers(offlineData);
      }
    } catch (e) {
      console.error("❌ Unexpected error:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Event listeners terpisah, tidak nested
  useEffect(() => {
    fetchMembers();
    
    // Listen untuk event dari MemberForm
    const handleMembersChanged = () => {
      fetchMembers();
    };
    
    // Listen untuk koneksi online kembali
    const handleOnline = () => {
      fetchMembers();
    };
    
    window.addEventListener('members-changed', handleMembersChanged);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('members-changed', handleMembersChanged);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      searchTerm === "" ||
      member.fullName.toLowerCase().includes(searchLower) ||
      member.memberNumber.toLowerCase().includes(searchLower) ||
      member.phone.includes(searchTerm);
    
    const matchCity = filterCity === "" || member.city === filterCity;
    const matchStatus = filterStatus === "" || member.status === filterStatus;
    
    return matchSearch && matchCity && matchStatus;
  });

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCity, filterStatus]);

  const cities = [...new Set(members.map(m => m.city))];

  const handleEdit = (member: Member) => {
    if (member.offline) {
      alert("Data ini masih pending sync. Tidak bisa diedit sebelum online.");
      return;
    }
    setMemberToEdit(member);
    setShowModal(true);
  };

  const handleCreate = () => {
    setMemberToEdit(null);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setMemberToEdit(null);
    fetchMembers();
  };

  const getStatusBadge = (status: string) => {
    const isActive = status === "active";
    return {
      className: isActive
        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400",
      text: isActive ? "✅ Aktif" : "⏸ Nonaktif"
    };
  };

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

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.currentTarget.value)}
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            <button
              onClick={handleCreate}
              class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Anggota
            </button>

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
          <>
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
                {paginatedMembers.map((member) => {
                  const badge = getStatusBadge(member.status);
                  return (
                    <tr key={member.id} class={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${member.offline ? 'opacity-75' : ''}`}>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-medium text-blue-600 dark:text-blue-400">{member.memberNumber}</span>
                          {member.offline && (
                            <span class="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
                              ⏳ Pending
                            </span>
                          )}
                        </div>
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
                        <span class={`px-3 py-1 text-xs font-medium rounded-full ${badge.className}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEdit(member)}
                          disabled={member.offline}
                          class={`text-sm font-medium ${
                            member.offline 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                          }`}
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

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
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            ></div>
            
            <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
              <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                <MemberForm 
                  member={memberToEdit}
                  onSuccess={handleSuccess}
                  onClose={() => setShowModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}