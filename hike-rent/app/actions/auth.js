"use server";

import { cookies } from "next/headers";
import { authLogin, authRegister, authLogout, authMe, authKey } from "@/services/gateway/auth";

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

    if (!data.success || !data.token) {
      return { success: false, error: data.message || "Login gagal." };
    }

    // Tentukan role: bila email mengandung 'admin' atau role dari backend 'admin'
    const role = (data.user?.role === "admin" || email.toLowerCase().includes("admin")) ? "admin" : "user";
    const user = { ...data.user, role };

    const cookieStore = await cookies();
    cookieStore.set("session_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: data.expires_in || 60 * 60 * 24 * 7,
      path: "/",
    });

    cookieStore.set("user_profile", JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return {
      success: true,
      user,
      token: data.token,
      apiKey: data.api_key,
      message: data.message || "Login berhasil.",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Terjadi kesalahan saat menghubungi server.",
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

    const regData = await authRegister({ name, email, password });

    if (!regData.success) {
      return { success: false, error: regData.message || "Registrasi gagal." };
    }

    // Auto-login setelah registrasi berhasil
    const loginResult = await loginAction({ email, password });
    if (loginResult.success) {
      return {
        success: true,
        user: loginResult.user,
        message: "Pendaftaran dan login berhasil!",
      };
    }

    return {
      success: true,
      user: regData.user,
      message: regData.message || "Pendaftaran akun berhasil. Silakan masuk.",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Terjadi kesalahan saat registrasi.",
    };
  }
}

/**
 * Server action untuk logout dan invalidasi token di server
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (token) {
      await authLogout(token).catch(() => {});
    }

    cookieStore.delete("session_token");
    cookieStore.delete("user_profile");

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
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { success: false, error: "Belum ada sesi aktif (token tidak ditemukan)." };
    }

    const data = await authMe(token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Server action untuk mengambil API Key kelompok (/key)
 */
export async function getKeyAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { success: false, error: "Akses ditolak: Memerlukan login untuk mendapatkan API Key." };
    }

    const data = await authKey(token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
