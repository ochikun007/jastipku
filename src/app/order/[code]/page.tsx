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

  // Elapsed Time hook
  const [elapsedTime, setElapsedTime] = useState("");

  useEffect(() => {
    // 4 is the index for "ready_to_deliver" (Pesanan Siap Antar)
    if (currentIndex >= 4 && request.linked_order_id) {
      api.getOrder(request.linked_order_id)
        .then(setOrderDetail)
        .catch(console.error);
    }
  }, [currentIndex, request.linked_order_id]);

  useEffect(() => {
    if (!timestamps["pending"]) return;
    
    // If completed, just show final duration and stop interval
    const startTime = new Date(timestamps["pending"]).getTime();
    const endTime = isCompleted && timestamps["completed"] 
      ? new Date(timestamps["completed"]).getTime() 
      : null;

    const updateTimer = () => {
      const now = endTime || Date.now();
      const diff = now - startTime;
      if (diff < 0) return setElapsedTime("0m 0s");
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        setElapsedTime(`${hours}j ${minutes}m ${seconds}d`);
      } else {
        setElapsedTime(`${minutes}m ${seconds}d`);
      }
    };

    updateTimer();
    let interval: NodeJS.Timeout | null = null;
    if (!isCompleted) {
      interval = setInterval(updateTimer, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timestamps, isCompleted]);

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
    <div className="min-h-screen pb-24 font-sans text-slate-800 selection:bg-blue-200 relative overflow-hidden bg-[#FAFAFA]">
      
      {/* --- LIQUID GLASS ANIMATED BACKGROUND BLOBS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 fixed">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply blur-[80px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 -right-32 w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply blur-[80px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 0], x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute -bottom-32 left-1/4 w-96 h-96 bg-pink-400/30 rounded-full mix-blend-multiply blur-[80px]"
        />
      </div>

      <div className="max-w-md mx-auto pt-10 px-4 relative z-10">
        
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Pelacakan Live</h1>
          <p className="text-[15px] font-medium text-slate-500 mt-1">
            {isCompleted ? "✨ Pesanan Selesai ✨" : "Status Pesanan Anda"}
          </p>
        </motion.div>

        {/* Customer Info Card - Liquid Glass */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[24px] overflow-hidden mb-6">
          <div className="divide-y divide-white/40">
            {request.order_number && (
              <div className="px-5 py-3.5 flex justify-between items-center text-[15px]">
                <span className="text-slate-500 font-medium">No. Order</span>
                <span className="font-bold text-blue-600">#{request.order_number}</span>
              </div>
            )}
            <div className="px-5 py-3.5 flex justify-between items-center text-[15px]">
              <span className="text-slate-500 font-medium">Pelanggan</span>
              <span className="font-semibold text-slate-800">{request.customer_name}</span>
            </div>
            <div className="px-5 py-3.5 flex justify-between items-center text-[15px]">
              <span className="text-slate-500 font-medium">Telepon</span>
              <span className="font-semibold text-slate-800">{request.customer_phone}</span>
            </div>
            {request.request_items && (
              <div className="px-5 py-3.5 text-[15px]">
                <div className="text-slate-500 font-medium mb-1">Pesanan</div>
                <div className="font-semibold text-slate-800 whitespace-pre-line leading-relaxed">{request.request_items}</div>
              </div>
            )}
            {request.store_preferences && (
              <div className="px-5 py-3.5 flex justify-between items-center text-[15px]">
                <span className="text-slate-500 font-medium">Toko</span>
                <span className="font-semibold text-slate-800">{request.store_preferences}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tracking Stepper */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[24px] p-6 mb-6 relative">
          
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Progres Pengiriman</h2>
            {elapsedTime && (
              <div className="bg-white/60 px-3 py-1 rounded-full text-[12px] font-bold text-blue-600 flex items-center gap-1.5 shadow-sm border border-white">
                <span className="text-sm">⏱️</span> {elapsedTime}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            {TRACKING_STEPS.map((step, index) => {
              const isDone = index <= currentIndex;
              const isActive = index === currentIndex;
              const stepTime = timestamps[step.key];

              return (
                <div key={step.key} className="flex gap-5 relative">
                  <div className="flex flex-col items-center w-6 shrink-0">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 border-white shadow-md z-10 transition-all duration-300 ${
                        isActive ? "bg-blue-500 ring-4 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : isDone ? "bg-purple-500" : "bg-white/50"
                      }`}
                    />
                    {index < TRACKING_STEPS.length - 1 && (
                      <div className={`w-0.5 h-full min-h-[36px] -mt-1 -mb-1 transition-all duration-300 ${isDone ? "bg-purple-400" : "bg-white/50"}`} />
                    )}
                  </div>
                  <div className={`pb-6 transition-all duration-300 ${isActive ? "opacity-100 scale-105 origin-left" : isDone ? "opacity-90" : "opacity-40"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[16px] ${isActive ? "font-bold text-blue-600" : "font-semibold text-slate-700"}`}>{step.label}</span>
                    </div>
                    {isDone && stepTime && (
                      <span className="text-[13px] text-slate-500 mt-1 block font-medium">{formatTrackingTime(stepTime)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Live GPS Map */}
        {request.courier_lat && request.courier_lng && !isCompleted && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[24px] overflow-hidden mb-6 relative">
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
              <div className="bg-white/70 backdrop-blur-md text-slate-800 px-4 py-2 rounded-full text-[13px] font-bold flex items-center gap-2 shadow-lg border border-white/50">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                Lokasi Kurir Live
              </div>
            </div>
            <div className="w-full h-[250px] relative pointer-events-none">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${request.courier_lng - 0.005},${request.courier_lat - 0.005},${request.courier_lng + 0.005},${request.courier_lat + 0.005}&layer=mapnik&marker=${request.courier_lat},${request.courier_lng}`}
                style={{ border: "none", filter: "contrast(1.1) saturate(1.2)" }}
              ></iframe>
            </div>
          </motion.div>
        )}

        {/* Receipt UI */}
        {orderDetail && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[24px] p-6 mb-6">
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">Rincian Tagihan</h2>
            <div className="space-y-3 mb-5">
              {orderDetail.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-[15px]">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-slate-800">{item.product_name}</p>
                    <p className="text-[13px] text-slate-500 font-medium">{item.quantity}x @ {formatCurrency(item.unit_price)}</p>
                  </div>
                  <p className="font-bold text-slate-800">{formatCurrency(item.line_total)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/40 pt-4 space-y-2 text-[15px]">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal Barang</span>
                <span className="font-bold text-slate-700">{formatCurrency(orderDetail.order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Ongkos Kirim</span>
                <span className="font-bold text-slate-700">{formatCurrency(orderDetail.order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-[18px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 pt-4 mt-2 border-t border-white/40">
                <span>Total Bayar</span>
                <span>{formatCurrency(orderDetail.order.total_amount)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Completion message & Review Section */}
        {isCompleted && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }} className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[24px] p-8 text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/30">
              <span className="text-4xl text-white">✓</span>
            </div>
            <p className="text-[22px] font-black text-slate-800 mb-1">Pesanan Selesai!</p>
            <p className="text-[15px] text-slate-500 font-medium mb-6">Terima kasih telah mempercayakan belanjaan Anda kepada kami. ✨</p>
            
            {request.proof_image_url && (
              <div className="mb-8 border border-white/60 p-2 bg-white/30 rounded-[20px] shadow-sm">
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-left pl-2">📸 Bukti Pengiriman</p>
                <img 
                  src={request.proof_image_url} 
                  alt="Bukti Pengiriman" 
                  className="w-full h-auto rounded-[14px] object-cover" 
                />
              </div>
            )}

            <div className="border-t border-white/40 pt-6">
              <p className="text-[16px] font-bold text-slate-800 mb-5">Seberapa puas Anda?</p>
              
              {reviewSubmitted ? (
                <div className="bg-white/50 rounded-[16px] p-5 border border-white/60">
                  <div className="flex justify-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-2xl drop-shadow-sm" style={{ color: star <= (request.review_rating || rating) ? "#F59E0B" : "#CBD5E1" }}>
                        ★
                      </span>
                    ))}
                  </div>
                  {(request.review_text || reviewText) && (
                    <p className="text-[15px] text-slate-600 italic font-medium">"{request.review_text || reviewText}"</p>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-4xl transition-transform active:scale-90 drop-shadow-sm hover:scale-110"
                        style={{ color: star <= rating ? "#F59E0B" : "#E2E8F0" }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <div className="space-y-4">
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Berikan ulasan Anda (opsional)..."
                        className="w-full text-[15px] px-5 py-4 bg-white/50 backdrop-blur-md rounded-[16px] focus:ring-4 focus:ring-blue-500/20 focus:bg-white/80 outline-none transition-all resize-none border border-white/60"
                        rows={3}
                      />
                      <button
                        onClick={() => void handleSubmitReview()}
                        disabled={submittingReview}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-[16px] shadow-lg shadow-blue-500/25 disabled:opacity-50 active:scale-[0.98] transition-transform text-[16px]"
                      >
                        {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Google Maps & WhatsApp link */}
        <div className="flex gap-3 mb-4">
          <a
            href={`https://wa.me/628123456789?text=Halo%20Admin%20Jstipku,%20saya%20pelanggan%20dengan%20nomor%20pesanan%20${request.order_number || request.request_code}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/25 px-4 py-4 text-[15px] font-bold text-white active:scale-[0.98] transition-transform"
          >
            💬 Chat Admin
          </a>

          {request.google_maps_link && (
            <a
              href={request.google_maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-[20px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm px-4 py-4 text-[15px] font-bold text-blue-600 active:scale-[0.98] transition-transform"
            >
              📍 Maps
            </a>
          )}
        </div>

        {/* Refresh button */}
        <button 
          type="button" 
          onClick={() => void handleManualRefresh()} 
          disabled={refreshing}
          className="w-full rounded-[20px] bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm px-4 py-4 text-[16px] font-bold text-slate-700 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {refreshing ? "Memperbarui..." : "Refresh Status"}
        </button>

        <p className="text-center text-[12px] text-slate-400 mt-5 uppercase tracking-widest font-bold">Sinkronisasi otomatis aktif</p>
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
