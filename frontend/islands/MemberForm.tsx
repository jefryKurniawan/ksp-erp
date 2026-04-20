/** @jsxImportSource preact */
import { useState } from "preact/hooks";

const API_URL = "http://localhost:3000";

interface MemberFormProps {
  onSuccess?: () => void;
}

export default function MemberForm({ onSuccess }: MemberFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "Magetan",
    idCard: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        setSuccess(`✅ Anggota ${json.data.fullName} berhasil ditambahkan!`);
        setFormData({
          fullName: "", email: "", phone: "", address: "", city: "Magetan", idCard: ""
        });
        onSuccess?.();
      } else {
        setError(json.error || "Gagal menambahkan anggota");
      }
    } catch (e) {
      setError("Tidak dapat terhubung ke backend");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [target.name]: target.value }));
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">Form Tambah Anggota</h3>
      
      {error && <div class="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div class="p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onInput={handleChange}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Contoh: Budi Santoso"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onInput={handleChange}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="budi@example.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">No. Telepon *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onInput={handleChange}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="081234567890"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kota</label>
          <select
            name="city"
            value={formData.city}
            onInput={handleChange}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="Magetan">Magetan</option>
            <option value="Madiun">Madiun</option>
            <option value="Ngawi">Ngawi</option>
            <option value="Ponorogo">Ponorogo</option>
            <option value="Pacitan">Pacitan</option>
          </select>
        </div>
        
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Alamat *</label>
          <textarea
            name="address"
            value={formData.address}
            onInput={handleChange}
            required
            rows={3}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Jl. Raya Magetan No. 10"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">NIK (Opsional)</label>
          <input
            type="text"
            name="idCard"
            value={formData.idCard}
            onInput={handleChange}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="3520011234567890"
          />
        </div>
      </div>
      
      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "💾 Simpan Anggota"}
        </button>
        <button
          type="button"
          onClick={() => {
            setFormData({ fullName: "", email: "", phone: "", address: "", city: "Magetan", idCard: "" });
            setError(null);
            setSuccess(null);
          }}
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          🔄 Reset
        </button>
      </div>
    </form>
  );
}