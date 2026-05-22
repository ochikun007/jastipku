"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function hashPassword(password: string): string {
  const salt = "jstipku-salt-2026"; 
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash;
}

export async function loginAdmin(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) {
    return { error: "Username tidak ditemukan." };
  }

  const hashed = hashPassword(password);
  if (data.password_hash !== hashed) {
    return { error: "Password salah." };
  }

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("admin_session", data.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect("/");
}

export async function registerAdmin(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const secret = formData.get("secret") as string;

  if (!username || !password || !secret) {
    return { error: "Semua kolom wajib diisi." };
  }

  if (secret !== "gembrotgemoy217") {
    return { error: "Secret code salah! Anda tidak diizinkan membuat akun admin." };
  }

  const hashed = hashPassword(password);

  const { error } = await supabase
    .from("admins")
    .insert({ username, password_hash: hashed });

  if (error) {
    if (error.code === "23505") { // unique violation
      return { error: "Username sudah digunakan." };
    }
    return { error: error.message || "Gagal membuat akun." };
  }

  return { success: "Akun berhasil dibuat! Silakan pindah ke tab Login." };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}
