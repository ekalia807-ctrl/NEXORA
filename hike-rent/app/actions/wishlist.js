"use server";

import {
  getWishlist,
  createWishlist,
  deleteWishlist,
} from "@/services/gateway/wishlist";
import { cookies } from "next/headers";

async function getSessionAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value || "";
  let user = null;
  const userProfileRaw = cookieStore.get("user_profile")?.value;
  if (userProfileRaw) {
    try {
      user = JSON.parse(userProfileRaw);
    } catch {}
  }
  return { token, user };
}

/**
 * Mengambil daftar seluruh wishlist untuk pengguna aktif.
 */
export async function fetchWishlistAction() {
  try {
    const { token, user } = await getSessionAuth();
    const list = await getWishlist(token);
    
    // Jika ada user aktif, kita prioritaskan wishlist milik user tersebut
    const filtered = Array.isArray(list)
      ? user?.id
        ? list.filter((item) => Number(item.user_id) === Number(user.id))
        : list
      : [];

    return { success: true, data: filtered };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Menambahkan alat ke dalam wishlist pengguna aktif.
 */
export async function addToWishlistAction(gearId) {
  try {
    const { token, user } = await getSessionAuth();
    if (!token || !user?.id) {
      return {
        success: false,
        error: "Harap login terlebih dahulu untuk menyimpan alat ke wishlist.",
        needLogin: true,
      };
    }

    const payload = {
      user_id: Number(user.id),
      gear_id: Number(gearId),
    };

    const res = await createWishlist(payload, token);
    return { success: true, data: res };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menghapus alat dari wishlist berdasarkan ID wishlist.
 */
export async function removeFromWishlistAction(wishlistId) {
  try {
    const { token } = await getSessionAuth();
    const res = await deleteWishlist(wishlistId, token);
    return { success: true, data: res };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
