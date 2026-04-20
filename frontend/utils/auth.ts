// Simple auth helper untuk MVP (localStorage-based)
// Untuk production, ganti dengan cookie + HTTP-only + backend validation

export interface User {
  id: string;
  name: string;
  email: string;
  role: "karyawan" | "owner";
}

export const auth = {
  // Login: simpan user ke localStorage (MVP only)
  login: (user: User) => {
    localStorage.setItem("ksp_user", JSON.stringify(user));
    return user;
  },

  // Logout: hapus session
  logout: () => {
    localStorage.removeItem("ksp_user");
  },

  // Get current user
  getUser: (): User | null => {
    try {
      const raw = localStorage.getItem("ksp_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Check if logged in
  isAuthenticated: (): boolean => {
    return auth.getUser() !== null;
  },

  // Check role
  hasRole: (role: "karyawan" | "owner"): boolean => {
    const user = auth.getUser();
    return user?.role === role || user?.role === "owner"; // owner bisa akses semua
  },

  // Redirect if not authenticated
  requireAuth: (redirectTo = "/login") => {
    if (!auth.isAuthenticated()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },

  // Redirect if not authorized
  requireRole: (role: "karyawan" | "owner", redirectTo = "/") => {
    if (!auth.hasRole(role)) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },
};