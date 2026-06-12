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
    <div className="min-h-screen bg-[#F2F2F7] pb-24 font-sans text-[#1C1C1E] selection:bg-blue-200">
      <div className="max-w-md mx-auto pt-8 px-4">
        
        {/* Title */}
        <div className="mb-6 px-2">
          <h1 className="text-3xl font-bold tracking-tight">Pelacakan</h1>
          <p className="text-[15px] text-[#8E8E93] mt-1">
            {isCompleted ? "Pesanan Selesai" : "Status Pesanan Anda"}
          </p>
        </div>

        {/* Customer Info Card - iOS List Group */}
        <div className="bg-white rounded-[14px] overflow-hidden mb-6">
          <div className="divide-y divide-[#E5E5EA]">
            {request.order_number && (
              <div className="px-4 py-3 flex justify-between items-center bg-white text-[15px]">
                <span className="text-[#8E8E93]">No. Order</span>
                <span className="font-semibold text-[#007AFF]">#{request.order_number}</span>
              </div>
            )}
            <div className="px-4 py-3 flex justify-between items-center bg-white text-[15px]">
              <span className="text-[#8E8E93]">Pelanggan</span>
              <span className="font-medium">{request.customer_name}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center bg-white text-[15px]">
              <span className="text-[#8E8E93]">Telepon</span>
              <span className="font-medium">{request.customer_phone}</span>
            </div>
            {request.request_items && (
              <div className="px-4 py-3 bg-white text-[15px]">
                <div className="text-[#8E8E93] mb-1">Pesanan</div>
                <div className="font-medium whitespace-pre-line leading-relaxed">{request.request_items}</div>
              </div>
            )}
            {request.store_preferences && (
              <div className="px-4 py-3 flex justify-between items-center bg-white text-[15px]">
                <span className="text-[#8E8E93]">Toko</span>
                <span className="font-medium">{request.store_preferences}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Stepper */}
        <div className="bg-white rounded-[14px] p-5 mb-6">
          <h2 className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-4">Progres</h2>
          <div className="flex flex-col">
            {TRACKING_STEPS.map((step, index) => {
              const isDone = index <= currentIndex;
              const isActive = index === currentIndex;
              const stepTime = timestamps[step.key];

              return (
                <div key={step.key} className="flex gap-4 relative">
                  <div className="flex flex-col items-center w-6 shrink-0">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${
                        isActive ? "bg-[#007AFF] ring-4 ring-blue-100" : isDone ? "bg-[#34C759]" : "bg-[#E5E5EA]"
                      }`}
                    />
                    {index < TRACKING_STEPS.length - 1 && (
                      <div className={`w-0.5 h-full min-h-[32px] -mt-1 -mb-1 ${isDone ? "bg-[#34C759]" : "bg-[#E5E5EA]"}`} />
                    )}
                  </div>
                  <div className={`pb-6 ${isActive ? "opacity-100" : isDone ? "opacity-75" : "opacity-40"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium">{step.label}</span>
                    </div>
                    {isDone && stepTime && (
                      <span className="text-[13px] text-[#8E8E93] mt-0.5 block">{formatTrackingTime(stepTime)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live GPS Map */}
        {request.courier_lat && request.courier_lng && !isCompleted && (
          <div className="bg-white rounded-[14px] overflow-hidden mb-6 relative">
            <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center">
              <div className="bg-white/80 backdrop-blur-md text-[#1C1C1E] px-3 py-1.5 rounded-full text-[13px] font-semibold flex items-center gap-2 shadow-sm border border-black/5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C759]"></span>
                </span>
                Lokasi Langsung
              </div>
            </div>
            <div className="w-full h-[250px] bg-[#E5E5EA] relative pointer-events-none">
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
          </div>
        )}

        {/* Receipt UI */}
        {orderDetail && (
          <div className="bg-white rounded-[14px] p-5 mb-6">
            <h2 className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Tagihan</h2>
            <div className="space-y-3 mb-4">
              {orderDetail.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-[15px]">
                  <div className="flex-1 pr-4">
                    <p className="font-medium text-[#1C1C1E]">{item.product_name}</p>
                    <p className="text-[13px] text-[#8E8E93]">{item.quantity}x @ {formatCurrency(item.unit_price)}</p>
                  </div>
                  <p className="font-medium text-[#1C1C1E]">{formatCurrency(item.line_total)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E5EA] pt-3 space-y-2 text-[15px]">
              <div className="flex justify-between text-[#8E8E93]">
                <span>Subtotal Barang</span>
                <span className="font-medium text-[#1C1C1E]">{formatCurrency(orderDetail.order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#8E8E93]">
                <span>Ongkos Kirim</span>
                <span className="font-medium text-[#1C1C1E]">{formatCurrency(orderDetail.order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-[17px] font-semibold text-[#1C1C1E] pt-3 mt-1 border-t border-[#E5E5EA]">
                <span>Total</span>
                <span>{formatCurrency(orderDetail.order.total_amount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Completion message & Review Section */}
        {isCompleted && (
          <div className="bg-white rounded-[14px] p-6 text-center mb-6 border border-[#E5E5EA]">
            <div className="w-16 h-16 bg-[#34C759]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-[20px] font-bold text-[#1C1C1E] mb-1">Pesanan Selesai</p>
            <p className="text-[15px] text-[#8E8E93] mb-6">Terima kasih telah menggunakan layanan kami.</p>
            
            <div className="border-t border-[#E5E5EA] pt-5 mt-2">
              <p className="text-[15px] font-semibold text-[#1C1C1E] mb-4">Nilai Pelayanan Kami</p>
              
              {reviewSubmitted ? (
                <div className="bg-[#F2F2F7] rounded-[12px] p-4">
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-xl" style={{ color: star <= (request.review_rating || rating) ? "#FF9500" : "#D1D1D6" }}>
                        ★
                      </span>
                    ))}
                  </div>
                  {(request.review_text || reviewText) && (
                    <p className="text-[14px] text-[#8E8E93] italic mt-2">"{request.review_text || reviewText}"</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-3xl transition-transform active:scale-95"
                        style={{ color: star <= rating ? "#FF9500" : "#E5E5EA" }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <div className="space-y-3">
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Ulasan (opsional)"
                        className="w-full text-[15px] px-4 py-3 bg-[#F2F2F7] rounded-[12px] focus:ring-2 focus:ring-[#007AFF] focus:bg-white outline-none transition resize-none border border-transparent focus:border-[#007AFF]"
                        rows={3}
                      />
                      <button
                        onClick={() => void handleSubmitReview()}
                        disabled={submittingReview}
                        className="w-full bg-[#007AFF] text-white font-semibold py-3.5 rounded-[12px] disabled:opacity-50 active:scale-[0.98] transition-transform"
                      >
                        {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google Maps link */}
        {request.google_maps_link && (
          <a
            href={request.google_maps_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#E5F1FF] px-4 py-3.5 text-[15px] font-semibold text-[#007AFF] active:bg-[#D1E5FF] transition mb-3"
          >
            📍 Buka di Maps
          </a>
        )}

        {/* Refresh button */}
        <button 
          type="button" 
          onClick={() => void handleManualRefresh()} 
          disabled={refreshing}
          className="w-full rounded-[14px] bg-white px-4 py-3.5 text-[15px] font-semibold text-[#1C1C1E] border border-[#E5E5EA] active:bg-[#F2F2F7] transition disabled:opacity-50"
        >
          {refreshing ? "Memperbarui..." : "Refresh Status"}
        </button>

        <p className="text-center text-[12px] text-[#8E8E93] mt-4 uppercase tracking-wide font-medium">Otomatis refresh per 5 detik</p>
      </div>
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
