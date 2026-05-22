"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAdmin, registerAdmin } from "@/app/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ffb347_0%,#ff8c61_48%,#f35b4b_100%)] px-4 py-4 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Memproses..." : label}
    </button>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  async function handleLogin(formData: FormData) {
    setError("");
    setSuccess("");
    const res = await loginAdmin(null, formData);
    if (res?.error) setError(res.error);
  }

  async function handleRegister(formData: FormData) {
    setError("");
    setSuccess("");
    const res = await registerAdmin(null, formData);
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setSuccess(res.success);
      setMode("login");
      (document.getElementById("register-form") as HTMLFormElement)?.reset();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fffaf4] p-4 text-[#2c1c14]">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-[0_24px_80px_rgba(100,49,16,0.12)]">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffb347_0%,#ff8c61_48%,#f35b4b_100%)] text-3xl shadow-lg">
            🔐
          </div>
          <h1 className="mt-4 font-[family:var(--font-display)] text-3xl font-bold">
            JSTIPKU Admin
          </h1>
          <p className="mt-2 text-sm text-[#8a6a56]">
            {mode === "login" ? "Masuk ke Dashboard" : "Buat Akun Admin Baru"}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-600">
            {success}
          </div>
        )}

        <div className="mb-6 flex rounded-xl bg-[#fff3e1] p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${mode === "login" ? "bg-white text-[#cc6431] shadow-sm" : "text-[#8a6a56]"}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${mode === "register" ? "bg-white text-[#cc6431] shadow-sm" : "text-[#8a6a56]"}`}
          >
            Create Account
          </button>
        </div>

        {mode === "login" ? (
          <form action={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#6d5549]">User ID</label>
              <input
                name="username"
                type="text"
                required
                placeholder="Masukkan User ID"
                className="w-full rounded-2xl border border-[#f2dfcf] bg-[#fffaf6] px-4 py-3 outline-none transition focus:border-[#cc6431]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#6d5549]">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="Masukkan Password"
                className="w-full rounded-2xl border border-[#f2dfcf] bg-[#fffaf6] px-4 py-3 outline-none transition focus:border-[#cc6431]"
              />
            </div>
            <SubmitButton label="Login ke Dashboard" />
          </form>
        ) : (
          <form id="register-form" action={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#6d5549]">User ID</label>
              <input
                name="username"
                type="text"
                required
                placeholder="Pilih User ID"
                className="w-full rounded-2xl border border-[#f2dfcf] bg-[#fffaf6] px-4 py-3 outline-none transition focus:border-[#cc6431]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#6d5549]">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="Buat Password"
                className="w-full rounded-2xl border border-[#f2dfcf] bg-[#fffaf6] px-4 py-3 outline-none transition focus:border-[#cc6431]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#6d5549]">Secret Code</label>
              <input
                name="secret"
                type="password"
                required
                placeholder="Kode Rahasia Admin"
                className="w-full rounded-2xl border border-[#f2dfcf] bg-[#fffaf6] px-4 py-3 outline-none transition focus:border-[#cc6431]"
              />
            </div>
            <SubmitButton label="Daftar Akun Admin" />
          </form>
        )}
      </div>
    </div>
  );
}
