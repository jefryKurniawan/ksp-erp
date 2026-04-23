/** @jsxImportSource preact */
import { useState } from "preact/hooks";

const API_URL = "http://localhost:3000";

interface MemberFormProps {
  member?: {
    id: string;
    memberNumber: string;
    fullName: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    idCard?: string;
    status: string;
  } | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function MemberForm({ member, onSuccess, onClose }: MemberFormProps) {
  const [formData, setFormData] = useState({
    fullName: member?.fullName || "",
    email: member?.email || "",
    phone: member?.phone || "",
    address: member?.address || "",
    city: member?.city || "Magetan",
    idCard: member?.idCard || "",
    status: member?.status || "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEdit = !!member;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = isEdit && member?.id
        ? `${API_URL}/members/${member.id}`
        : `${API_URL}/members`;
      
      const method = isEdit ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const json = await res.json();

      // ✅ Handle offline response (HANYA SATU BLOCK)
      if (json.offline) {
        setSuccess(isEdit 
          ? `✅ Perubahan disimpan offline. Akan sinkron saat online.` 
          : `✅ Anggota ${formData.fullName} disimpan offline. Akan sinkron saat online.`
        );
        
        if (!isEdit) {
          setFormData({
            fullName: "",
            email: "",
            phone: "",
            address: "",
            city: "Magetan",
            idCard: "",
            status: "active",
          });
        }
        
        // Trigger refresh parent table
        setTimeout(() => {
          onSuccess?.();
          window.dispatchEvent(new CustomEvent('members-changed'));
        }, 1000);
        
        return;
      }

      // Handle online response
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      if (json.success) {
        const memberName = json.data?.fullName || formData.fullName;
        setSuccess(isEdit 
          ? `✅ Anggota ${memberName} berhasil diupdate!` 
          : `✅ Anggota ${memberName} berhasil ditambahkan!`
        );
        
        if (!isEdit) {
          setFormData({
            fullName: "",
            email: "",
            phone: "",
            address: "",
            city: "Magetan",
            idCard: "",
            status: "active",
          });
        }
        
        setTimeout(() => {
          onSuccess?.();
          window.dispatchEvent(new CustomEvent('members-changed'));
        }, 1000);
      } else {
        throw new Error(json.error || "Operasi gagal");
      }
    } catch (e: any) {
      setError(`❌ ${e.message || "Terjadi kesalahan jaringan"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData(prev => ({ ...prev, [target.name]: target.value }));
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <span>{isEdit ? "✏️" : "➕"}</span>
        {isEdit ? "Edit Anggota" : "Tambah Anggota Baru"}
      </h3>
      
      {error && (
        <div class="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-300 dark:border-red-700">
          {error}
        </div>
      )}
      {success && (
        <div class="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm border border-green-300 dark:border-green-700">
          {success}
        </div>
      )}
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nama Lengkap <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onInput={handleChange}
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Contoh: Budi Santoso"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onInput={handleChange}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="budi@example.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            No. Telepon <span class="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onInput={handleChange}
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="081234567890"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kota
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="Magetan">Magetan</option>
            <option value="Madiun">Madiun</option>
            <option value="Ngawi">Ngawi</option>
            <option value="Ponorogo">Ponorogo</option>
            <option value="Pacitan">Pacitan</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="active">✅ Aktif</option>
            <option value="inactive">⏸ Nonaktif</option>
          </select>
        </div>
        
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alamat <span class="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onInput={handleChange}
            required
            rows={3}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Jl. Raya Magetan No. 10"
          />
        </div>
        
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            NIK (Opsional)
          </label>
          <input
            type="text"
            name="idCard"
            value={formData.idCard}
            onInput={handleChange}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="3520011234567890"
          />
        </div>
      </div>
      
      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/30"
        >
          {loading ? (
            <span class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Menyimpan...
            </span>
          ) : (
            <span class="flex items-center justify-center gap-2">
              <span>💾</span>
              {isEdit ? "Update Anggota" : "Simpan Anggota"}
            </span>
          )}
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
  );
}