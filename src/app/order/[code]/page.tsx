"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { OrderRequest, TrackingStatus } from "@/lib/types";
import { use } from "react";
import { motion } from "framer-motion";

/* ─── Tracking Steps Definition ─── */
const TRACKING_STEPS: { key: TrackingStatus; label: string; icon: string }[] = [
  { key: "pending", label: "Pesanan Dibuat", icon: "📝" },
  { key: "heading_to_store", label: "Jastip Menuju Lokasi Pesanan", icon: "🛵" },
  { key: "picking_up", label: "Jastip Mengambil Pesanan", icon: "🛒" },
  { key: "ready_to_deliver", label: "Pesanan Siap Antar", icon: "📦" },
  { key: "delivering", label: "Jastip Mengantar Pesanan ke Lokasi", icon: "🛵" },
  { key: "arrived", label: "Jastip Sudah Sampai di Lokasi", icon: "📍" },
  { key: "completed", label: "Pesanan Selesai", icon: "✅" },
];

function getStepIndex(status: TrackingStatus): number {
  return TRACKING_STEPS.findIndex((s) => s.key === status);
}

/* ─── Order Form Component ─── */
function OrderForm({ code, onSubmitted }: { code: string; onSubmitted: (req: OrderRequest) => void }) {
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
      const result = await api.submitOrderRequest(code, {
        customer_name: form.customerName,
        customer_phone: form.customerPhone,
        request_items: form.requestItems,
        store_preferences: form.storePreferences,
        google_maps_link: form.googleMapsLink,
        note: form.note,
      });
      onSubmitted(result);
    } catch (err) {
      setError((err as Error).message || "Gagal mengirim pesanan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="order-page-container relative overflow-hidden min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-[#ffb347] opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-72 h-72 rounded-full bg-[#f35b4b] opacity-10 blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="order-page-card relative z-10"
      >
        <div className="order-page-header">
          <div className="order-page-logo-container mb-4 flex justify-center">
            <img src="/logo.png" alt="Jstipku Logo" className="w-48 h-auto object-contain" />
          </div>
        </div>

        <div className="order-page-body">
          <h2 className="order-form-heading">Buat Pesanan Anda</h2>
          <p className="order-form-desc">Isi form di bawah ini untuk memesan barang yang Anda inginkan. Jastip kami akan segera memproses pesanan Anda!</p>

          {error && <div className="order-form-error">{error}</div>}

          <motion.form 
            onSubmit={handleSubmit} 
            className="order-form"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label">Nama Lengkap *</label>
              <input
                required
                value={form.customerName}
                onChange={(e) => setForm((c) => ({ ...c, customerName: e.target.value }))}
                placeholder="Nama Anda"
                className="order-form-input"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label">Nomor WhatsApp *</label>
              <input
                required
                value={form.customerPhone}
                onChange={(e) => setForm((c) => ({ ...c, customerPhone: e.target.value }))}
                placeholder="09xxxxxxxx"
                className="order-form-input"
                type="tel"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label">📝 Daftar Pesanan *</label>
              <textarea
                required
                value={form.requestItems}
                onChange={(e) => setForm((c) => ({ ...c, requestItems: e.target.value }))}
                placeholder={"Contoh:\nJambu 2 biji\nCoca Cola 3\nAyam Bakar 1 porsi"}
                className="order-form-textarea"
                rows={4}
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label">Pilihan Toko (Opsional)</label>
              <input
                value={form.storePreferences}
                onChange={(e) => setForm((c) => ({ ...c, storePreferences: e.target.value }))}
                placeholder="Nama toko / warung (opsional)"
                className="order-form-input"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label">📍 Link Google Maps (Alamat Pengiriman)</label>
              <input
                value={form.googleMapsLink}
                onChange={(e) => setForm((c) => ({ ...c, googleMapsLink: e.target.value }))}
                placeholder="Tempel link Google Maps Anda"
                className="order-form-input"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label">Catatan Tambahan</label>
              <input
                value={form.note}
                onChange={(e) => setForm((c) => ({ ...c, note: e.target.value }))}
                placeholder="Pesan khusus (opsional)"
                className="order-form-input"
              />
            </motion.div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={submitting} 
              className="order-form-submit"
            >
              {submitting ? "Mengirim..." : "🚀 Kirim Pesanan"}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Tracking View Component ─── */
function formatTrackingTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function TrackingView({ request, onRefresh }: { request: OrderRequest; onRefresh: () => void }) {
  const currentIndex = getStepIndex(request.tracking_status);
  const isCompleted = request.tracking_status === "completed";
  const timestamps = request.tracking_timestamps || {};
  const [refreshing, setRefreshing] = useState(false);

  async function handleManualRefresh() {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <div className="order-page-container relative overflow-hidden min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-[#ffb347] opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-72 h-72 rounded-full bg-[#f35b4b] opacity-10 blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="order-page-card relative z-10"
      >
        <div className="order-page-header">
          <div className="order-page-logo-container mb-2 flex justify-center">
            <img src="/logo.png" alt="Jstipku Logo" className="w-48 h-auto object-contain" />
          </div>
          <p className="order-page-subtitle mt-2">{isCompleted ? "🎉 Pesanan Selesai 🎉" : "Pelacakan Pesanan"}</p>
          {request.order_number && (
            <p style={{ marginTop: "0.5rem", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.05em" }}>Order #{request.order_number}</p>
          )}
        </div>

        <div className="order-page-body">
          {/* Customer info card */}
          <div className="tracking-info-card">
            {request.order_number && (
              <div className="tracking-info-row">
                <span className="tracking-info-label">No. Order</span>
                <span className="tracking-info-value" style={{ color: "#cc6431" }}>#{request.order_number}</span>
              </div>
            )}
            <div className="tracking-info-row">
              <span className="tracking-info-label">Pelanggan</span>
              <span className="tracking-info-value">{request.customer_name}</span>
            </div>
            <div className="tracking-info-row">
              <span className="tracking-info-label">Telepon</span>
              <span className="tracking-info-value">{request.customer_phone}</span>
            </div>
            {request.request_items && (
              <div className="tracking-info-row tracking-info-row-col">
                <span className="tracking-info-label">Pesanan</span>
                <span className="tracking-info-value tracking-info-items">{request.request_items}</span>
              </div>
            )}
            {request.store_preferences && (
              <div className="tracking-info-row">
                <span className="tracking-info-label">Toko</span>
                <span className="tracking-info-value">{request.store_preferences}</span>
              </div>
            )}
          </div>

          {/* Tracking Stepper */}
          <motion.div 
            className="tracking-stepper"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            {TRACKING_STEPS.map((step, index) => {
              const isDone = index <= currentIndex;
              const isActive = index === currentIndex;
              const stepTime = timestamps[step.key];

              return (
                <motion.div 
                  key={step.key} 
                  className="tracking-step"
                  variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                >
                  <div className="tracking-step-line-area">
                    <motion.div 
                      className={`tracking-step-dot ${isDone ? "tracking-step-dot-done" : ""} ${isActive ? "tracking-step-dot-active" : ""}`}
                      initial={isDone || isActive ? { scale: 0 } : false}
                      animate={isDone || isActive ? { scale: 1 } : false}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {isDone ? "✓" : step.icon}
                    </motion.div>
                    {index < TRACKING_STEPS.length - 1 && (
                      <div className={`tracking-step-line ${isDone ? "tracking-step-line-done" : ""}`} />
                    )}
                  </div>
                  <div className={`tracking-step-content ${isDone ? "tracking-step-content-done" : ""} ${isActive ? "tracking-step-content-active" : ""}`}>
                    <span className="tracking-step-label">{step.label}</span>
                    {isDone && stepTime && (
                      <span className="tracking-step-time">{formatTrackingTime(stepTime)}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Completion message */}
          {isCompleted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="tracking-complete-msg"
            >
              <p className="tracking-complete-title">Terima kasih sudah menggunakan jasa <strong>Jstipku</strong>! 🧡</p>
              <p className="tracking-complete-sub">Jangan lupa order lagi ya!</p>
            </motion.div>
          )}

          {/* Google Maps link */}
          {request.google_maps_link && (
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={request.google_maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="tracking-maps-btn"
            >
              📍 Buka di Google Maps
            </motion.a>
          )}

          {/* Refresh button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button" 
            onClick={() => void handleManualRefresh()} 
            disabled={refreshing}
            className="mt-2 rounded-xl bg-[#cc6431] px-4 py-2 text-white font-semibold flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {refreshing ? "🔄 Memperbarui..." : "🔄 Refresh Status"}
          </motion.button>

          <p className="tracking-refresh-note">Halaman ini otomatis memperbarui status setiap 5 detik.</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page Component ─── */
export default function OrderRequestPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [request, setRequest] = useState<OrderRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  async function fetchRequest() {
    try {
      const data = await api.getOrderRequestByCode(code);
      if (!data) {
        setNotFound(true);
      } else {
        setRequest(data);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh every 10 seconds when tracking
  useEffect(() => {
    if (!request || request.status === "waiting" || request.tracking_status === "completed") return;
    const interval = setInterval(() => {
      void fetchRequest();
    }, 5_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.status, request?.tracking_status]);

  if (loading) {
    return (
      <div className="order-page-container">
        <div className="order-page-card">
          <div className="order-page-body" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div className="order-page-logo" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>📦</div>
            <p style={{ marginTop: "1rem", color: "#8a6a56" }}>Memuat pesanan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="order-page-container">
        <div className="order-page-card">
          <div className="order-page-body" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div className="order-page-logo">😕</div>
            <h2 style={{ marginTop: "1rem", color: "#2c1c14" }}>Link Tidak Ditemukan</h2>
            <p style={{ marginTop: "0.5rem", color: "#8a6a56" }}>Link pesanan ini tidak valid atau sudah kadaluarsa.</p>
          </div>
        </div>
      </div>
    );
  }

  if (request!.status === "waiting") {
    return <OrderForm code={code} onSubmitted={(r) => setRequest(r)} />;
  }

  return <TrackingView request={request!} onRefresh={() => void fetchRequest()} />;
}
