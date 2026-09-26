"use server";

import { authLogin, authRegister, authLogout, authMe, authKey } from "@/services/gateway/auth";
import { saveSession, getCurrentSession, destroySession } from "@/lib/server/session";

// Daftar email resmi yang memiliki hak akses Admin
const ADMIN_WHITELIST = [
  "admin@hikerent.com",
  "admin@nexora.id",
];

/**
 * Server action untuk memproses login pengguna
 */
export async function loginAction(payload) {
  try {
    const rawEmail = typeof payload.get === "function" ? payload.get("email") : payload.email;
    const rawPassword = typeof payload.get === "function" ? payload.get("password") : payload.password;
    const email = String(rawEmail || "").trim().toLowerCase();
    const password = String(rawPassword || "").trim();

    if (!email || !password) {
      return { success: false, error: "Email dan kata sandi wajib diisi." };
    }

    const data = await authLogin(email, password);

    // Ekstrak token dari respon API v3 (data.data.access_token) atau fallback v2 (data.token)
    const token =
      data.data?.access_token ||
      data.data?.token ||
      data.token ||
      data.access_token;

    if (!data.success || !token) {
      return { success: false, error: data.message || "Email atau kata sandi tidak cocok." };
    }

    // Ekstrak profil user dari respon API v3 (data.data.user) atau fallback v2 (data.user)
    const rawUser = data.data?.user || data.user || {};

    // Penentuan role yang AMAN:
    // Hanya berikan 'admin' jika backend secara eksplisit menyatakan role admin ATAU
    // email cocok eksak dengan daftar email resmi admin terdaftar (bukan substring .includes).
    const role =
      rawUser.role === "admin" || ADMIN_WHITELIST.includes(email)
        ? "admin"
        : "user";

    const user = {
      ...rawUser,
      id: rawUser.id || rawUser.user_id,
      role,
      email: rawUser.email || email,
    };

    const expiresIn =
      data.data?.expires_in || data.expires_in || 60 * 60 * 24 * 7;

    // Simpan sesi terenkripsi (AES-256-GCM) dalam httpOnly cookie
    await saveSession({
      token,
      user,
      maxAge: expiresIn,
    });

    // Kembalikan profil tampilan yang aman ke client (TANPA membocorkan token Bearer mentah)
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name || "Pengguna",
        email: user.email,
        role: user.role,
        whatsapp: user.whatsapp || "",
      },
      message: data.message || "Login berhasil.",
    };
  } catch (err) {
    let errorMsg = err.message || "Gagal menghubungi server database.";
    if (errorMsg.includes("401") || errorMsg.toLowerCase().includes("unauthorized")) {
      errorMsg = "Email atau kata sandi yang Anda masukkan salah.";
    }
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Server action untuk registrasi akun baru (publik)
 */
export async function registerAction(payload) {
  try {
    const rawName = typeof payload.get === "function" ? payload.get("name") : payload.name;
    const rawEmail = typeof payload.get === "function" ? payload.get("email") : payload.email;
    const rawPassword = typeof payload.get === "function" ? payload.get("password") : payload.password;
    const name = String(rawName || "").trim();
    const email = String(rawEmail || "").trim().toLowerCase();
    const password = String(rawPassword || "").trim();

    if (!email || !password) {
      return { success: false, error: "Email dan kata sandi wajib diisi." };
    }

    if (password.length < 6) {
      return { success: false, error: "Kata sandi minimal 6 karakter." };
    }

    const regData = await authRegister({ name, email, password });

    if (!regData.success) {
      return { success: false, error: regData.message || "Registrasi gagal." };
    }

    // Coba auto-login setelah pendaftaran berhasil
    const loginResult = await loginAction({ email, password });
    if (loginResult.success) {
      return {
        success: true,
        autoLogin: true,
        user: loginResult.user,
        message: "Pendaftaran dan login berhasil!",
      };
    }

    // Jika registrasi berhasil namun auto-login tertunda/gagal
    return {
      success: true,
      autoLogin: false,
      user: regData.data?.user || regData.user,
      message: regData.message || "Pendaftaran akun berhasil. Silakan masuk dengan akun baru Anda.",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Terjadi kesalahan saat registrasi akun.",
    };
  }
}

/**
 * Server action untuk logout dan invalidasi token di server
 */
export async function logoutAction() {
  try {
    const { token } = await getCurrentSession();

    if (token) {
      await authLogout(token).catch(() => {});
    }

    // Hapus seluruh cookie sesi secara permanen
    await destroySession();

    return { success: true, message: "Berhasil keluar." };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Server action untuk cek profil sesi aktif (/me)
 */
export async function getMeAction() {
  try {
    const { token, user } = await getCurrentSession();

    if (!token) {
      return { success: false, error: "Belum ada sesi aktif (token tidak ditemukan)." };
    }

    const data = await authMe(token).catch(() => null);
    const backendProfile = data?.data?.session || data?.data || data?.user || null;

    return {
      success: true,
      data: backendProfile || user,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Server action untuk mengambil API Key kelompok (/key)
 */
export async function getKeyAction() {
  try {
    const { token, isAdmin } = await getCurrentSession();

    if (!token) {
      return { success: false, error: "Akses ditolak: Memerlukan login untuk mendapatkan API Key." };
    }

    const data = await authKey(token);
    const apiKey = data.data?.api_key || data.api_key || process.env.NEXT_PUBLIC_API_KEY;
    return { success: true, data: { api_key: apiKey }, raw: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
