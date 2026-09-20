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

    // Ekstrak token dari respon API v3 (data.data.access_token) atau fallback v2 (data.token)
    const token =
      data.data?.access_token ||
      data.data?.token ||
      data.token ||
      data.access_token;

    if (!data.success || !token) {
      return { success: false, error: data.message || "Login gagal." };
    }

    // Ekstrak profil user dari respon API v3 (data.data.user) atau fallback v2 (data.user)
    const rawUser = data.data?.user || data.user || {};

    // Tentukan role: bila role dari backend 'admin' atau email mengandung 'admin'
    const role =
      rawUser.role === "admin" || email.toLowerCase().includes("admin")
        ? "admin"
        : "user";
    const user = { ...rawUser, role, email: rawUser.email || email };

    const expiresIn =
      data.data?.expires_in || data.expires_in || 60 * 60 * 24 * 7;

    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
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
      token,
      apiKey:
        data.data?.api_key ||
        data.api_key ||
        process.env.NEXT_PUBLIC_API_KEY,
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
      user: regData.data?.user || regData.user,
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
    const userProfile = data.data?.session || data.data || data.user || data;
    return { success: true, data: userProfile };
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
    const apiKey = data.data?.api_key || data.api_key || process.env.NEXT_PUBLIC_API_KEY;
    return { success: true, data: { api_key: apiKey }, raw: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

