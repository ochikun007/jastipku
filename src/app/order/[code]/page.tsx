"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { OrderRequest, TrackingStatus, OrderDetail } from "@/lib/types";
import { use } from "react";
import { motion } from "framer-motion";

/* ─── Tracking Steps Definition ─── */
const TRACKING_STEPS: { key: TrackingStatus; label: string; icon: string }[] = [
  { key: "pending", label: "Pesanan Dibuat", icon: "📝" },
  { key: "accepted", label: "Pesanan Diterima", icon: "🤝" },
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
          <img src="/logo.png" alt="Jstipku Logo" className="w-full h-auto object-cover" />
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
              <label className="order-form-label">📍 Link Google Maps (Alamat Pengiriman) <span className="text-xs font-normal text-gray-500 ml-1">(Opsional)</span></label>
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

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="p-4 bg-orange-50 border border-orange-200 rounded-2xl mb-4 text-sm text-orange-900 shadow-sm">
              <p className="font-bold flex items-center gap-2 mb-1">
                <span className="text-xl">💰</span> Informasi Pembayaran
              </p>
              <p>Saat ini pembayaran <strong>hanya menggunakan "CASH" (Tunai)</strong>.</p>
              <p>Diharapkan pelanggan menyiapkan dan <strong>membayar dengan uang pas</strong> saat pesanan tiba. Terima kasih!! 🙏</p>
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function TrackingView({ request, onRefresh }: { request: OrderRequest; onRefresh: () => void }) {
  const currentIndex = getStepIndex(request.tracking_status);
  const isCompleted = request.tracking_status === "completed";
  const timestamps = request.tracking_timestamps || {};
  const [refreshing, setRefreshing] = useState(false);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);

  // Review states
  const [rating, setRating] = useState(request.review_rating || 0);
  const [reviewText, setReviewText] = useState(request.review_text || "");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(!!request.review_rating);

  useEffect(() => {
    // 4 is the index for "ready_to_deliver" (Pesanan Siap Antar)
    if (currentIndex >= 4 && request.linked_order_id) {
      api.getOrder(request.linked_order_id)
        .then(setOrderDetail)
        .catch(console.error);
    }
  }, [currentIndex, request.linked_order_id]);

  async function handleManualRefresh() {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  async function handleSubmitReview() {
    if (rating === 0) return;
    setSubmittingReview(true);
    try {
      await api.submitOrderReview(request.request_code, rating, reviewText);
      setReviewSubmitted(true);
      onRefresh(); // refresh the main state to save it
    } catch (err) {
      alert("Gagal mengirim ulasan: " + (err as Error).message);
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="order-page-container relative overflow-hidden min-h-screen bg-gradient-to-br from-[#fff1eb] via-[#fffaf7] to-[#ffece6] pb-24">
      {/* BACKGROUND FLOATING EMOJIS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div style={{ willChange: "transform" }} animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-[20%] left-[10%] text-6xl opacity-[0.04]">📦</motion.div>
        <motion.div style={{ willChange: "transform" }} animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }} className="absolute top-[60%] left-[15%] text-5xl opacity-[0.04]">🛵</motion.div>
        <motion.div style={{ willChange: "transform" }} animate={{ y: [0, -25, 0], rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }} className="absolute top-[30%] right-[10%] text-6xl opacity-[0.04]">🛍️</motion.div>
        <motion.div style={{ willChange: "transform" }} animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", delay: 0.5 }} className="absolute top-[70%] right-[15%] text-5xl opacity-[0.04]">🍔</motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="order-page-card relative z-10"
      >
        <div className="order-page-header">
          <img src="/logo.png" alt="Jstipku Logo" className="w-full h-auto object-cover" />
          <p className="order-page-subtitle mt-2 font-semibold text-[#6d5549]">{isCompleted ? "🎉 Pesanan Selesai 🎉" : "Pelacakan Pesanan"}</p>
          {request.order_number && (
            <p style={{ marginTop: "0.25rem", marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.05em", color: "#2c1c14" }}>Order #{request.order_number}</p>
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
                      className={`tracking-step-dot ${isDone ? "tracking-step-dot-done" : ""} ${isActive ? "tracking-step-dot-active shadow-[0_0_15px_rgba(204,100,49,0.5)]" : ""}`}
                      initial={isDone || isActive ? { scale: 0 } : false}
                      animate={isActive ? { scale: [1, 1.15, 1] } : (isDone ? { scale: 1 } : false)}
                      transition={isActive ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { type: "spring", stiffness: 300, damping: 20 }}
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

          {/* Live GPS Map */}
          {request.courier_lat && request.courier_lng && !isCompleted && (
            <motion.div 
              className="mt-6 border-2 border-[#cc6431] rounded-[24px] overflow-hidden shadow-[0_0_25px_rgba(204,100,49,0.2)]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-[#cc6431] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  Lacak Kurir Secara Langsung
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <div className="w-full h-[250px] bg-[#fffaf6] relative pointer-events-none">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${request.courier_lng - 0.005},${request.courier_lat - 0.005},${request.courier_lng + 0.005},${request.courier_lat + 0.005}&layer=mapnik&marker=${request.courier_lat},${request.courier_lng}`}
                  style={{ border: "none" }}
                ></iframe>
              </div>
            </motion.div>
          )}

          {/* Receipt UI */}
          {orderDetail && (
            <motion.div 
              className="mt-6 border border-[#f2dfcf] bg-white/80 rounded-[28px] p-5 shadow-sm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4 border-b border-[#f2dfcf]/50 pb-3">
                <span className="text-xl">🧾</span>
                <h3 className="font-bold text-[#4a3525] uppercase tracking-wider text-xs">Rincian Tagihan</h3>
              </div>
              
              <div className="space-y-3 mb-4">
                {orderDetail.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex-1 pr-4">
                      <p className="font-semibold text-[#2c1c14]">{item.product_name}</p>
                      <p className="text-xs text-[#8a6a56]">{item.quantity}x @ {formatCurrency(item.unit_price)}</p>
                    </div>
                    <p className="font-semibold text-[#4a3525]">{formatCurrency(item.line_total)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-[#f2dfcf] pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-[#6d5549]">
                  <span>Subtotal Barang</span>
                  <span className="font-medium">{formatCurrency(orderDetail.order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6d5549]">
                  <span>Ongkos Kirim (Jastip)</span>
                  <span className="font-medium">{formatCurrency(orderDetail.order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#cc6431] pt-3 mt-1 border-t border-[#f2dfcf]/50">
                  <span>Total Harus Dibayar</span>
                  <span>{formatCurrency(orderDetail.order.total_amount)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Completion message & Review Section */}
          {isCompleted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="mt-6 border border-[#f2dfcf] bg-white/80 rounded-[28px] p-6 shadow-sm text-center"
            >
              <motion.div 
                className="text-6xl mb-4"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                🎉
              </motion.div>
              <p className="text-xl font-bold text-[#2c1c14] mb-2 font-[family:var(--font-display)]">Pesanan Selesai!</p>
              <p className="text-[#8a6a56] text-sm mb-6">Terima kasih sudah menggunakan jasa <strong>Jstipku</strong>. Jangan lupa order lagi ya! 🧡</p>
              
              <div className="border-t border-[#f2dfcf]/50 pt-5 mt-2">
                <p className="font-semibold text-[#4a3525] mb-3">Bagaimana pelayanan kami?</p>
                
                {reviewSubmitted ? (
                  <div className="bg-[#fffaf6] rounded-xl p-4 border border-[#f2dfcf]">
                    <div className="flex justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-2xl" style={{ color: star <= (request.review_rating || rating) ? "#ffb347" : "#e6d8cf" }}>
                          ★
                        </span>
                      ))}
                    </div>
                    {(request.review_text || reviewText) && (
                      <p className="text-sm text-[#6d5549] italic mt-2">"{request.review_text || reviewText}"</p>
                    )}
                    <p className="text-xs text-emerald-600 font-semibold mt-3">✓ Ulasan telah dikirim. Terima kasih!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-3xl transition-transform hover:scale-110 active:scale-95"
                          style={{ color: star <= rating ? "#ffb347" : "#e6d8cf" }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Tulis ulasan Anda (opsional)..."
                          className="w-full text-sm px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-xl focus:border-[#cc6431] outline-none transition resize-none"
                          rows={3}
                        />
                        <button
                          onClick={() => void handleSubmitReview()}
                          disabled={submittingReview}
                          className="w-full bg-[#cc6431] text-white font-bold py-3 rounded-xl disabled:opacity-50"
                        >
                          {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
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
