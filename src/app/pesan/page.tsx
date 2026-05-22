"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function PublicOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    requestItems: "",
    storePreferences: "",
    googleMapsLink: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await api.createDirectOrderRequest({
        customer_name: form.customerName,
        customer_phone: form.customerPhone,
        request_items: form.requestItems,
        store_preferences: form.storePreferences,
        google_maps_link: form.googleMapsLink,
        note: form.note,
      });
      // Redirect to their tracking page
      router.push(`/order/${result.request_code}`);
    } catch (err) {
      setError((err as Error).message || "Gagal mengirim pesanan. Coba lagi.");
      setSubmitting(false);
    }
  }

  return (
    <div className="order-page-container min-h-screen bg-[#fffaf4] flex justify-center py-8 px-4">
      <div className="order-page-card w-full max-w-xl bg-white rounded-[32px] shadow-[0_24px_80px_rgba(100,49,16,0.12)] p-6 sm:p-8">
        <div className="order-page-header text-center mb-8">
          <div className="order-page-logo-container mb-4 flex justify-center">
            <img src="/logo.png" alt="Jstipku Logo" className="w-48 h-auto object-contain" />
          </div>
        </div>

        <div className="order-page-body">
          <h2 className="order-form-heading text-2xl font-bold text-[#2c1c14] mb-2 font-[family:var(--font-display)] text-center">Buat Pesanan Anda</h2>
          <p className="order-form-desc text-sm text-[#8a6a56] mb-6 text-center">Isi form di bawah ini untuk memesan barang yang Anda inginkan. Jastip kami akan segera memproses pesanan Anda!</p>

          {error && <div className="order-form-error mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm font-semibold">{error}</div>}

          <form onSubmit={handleSubmit} className="order-form space-y-4">
            <div className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">Nama Lengkap *</label>
              <input
                required
                value={form.customerName}
                onChange={(e) => setForm((c) => ({ ...c, customerName: e.target.value }))}
                placeholder="Nama Anda"
                className="order-form-input w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition"
              />
            </div>

            <div className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">Nomor WhatsApp *</label>
              <input
                required
                value={form.customerPhone}
                onChange={(e) => setForm((c) => ({ ...c, customerPhone: e.target.value }))}
                placeholder="08123456789"
                className="order-form-input w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition"
              />
            </div>

            <div className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">📝 Daftar Pesanan *</label>
              <textarea
                required
                value={form.requestItems}
                onChange={(e) => setForm((c) => ({ ...c, requestItems: e.target.value }))}
                placeholder="Contoh:&#10;1x Nasi Goreng Spesial&#10;2x Es Teh Manis"
                rows={4}
                className="order-form-textarea w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition resize-none"
              />
            </div>

            <div className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">Pilihan Toko (Opsional)</label>
              <input
                value={form.storePreferences}
                onChange={(e) => setForm((c) => ({ ...c, storePreferences: e.target.value }))}
                placeholder="Nama toko / warung (opsional)"
                className="order-form-input w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition"
              />
            </div>

            <div className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">📍 Link Google Maps (Alamat Pengiriman)</label>
              <input
                value={form.googleMapsLink}
                onChange={(e) => setForm((c) => ({ ...c, googleMapsLink: e.target.value }))}
                placeholder="Tempel link Google Maps Anda"
                className="order-form-input w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition"
              />
            </div>

            <div className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">Catatan Tambahan</label>
              <input
                value={form.note}
                onChange={(e) => setForm((c) => ({ ...c, note: e.target.value }))}
                placeholder="Pesan khusus (opsional)"
                className="order-form-input w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition"
              />
            </div>

            <button type="submit" disabled={submitting} className="order-form-submit w-full mt-6 py-4 bg-[linear-gradient(135deg,#ffb347_0%,#ff8c61_48%,#f35b4b_100%)] text-white font-bold rounded-2xl hover:opacity-90 transition disabled:opacity-50">
              {submitting ? "Mengirim..." : "🚀 Kirim Pesanan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
