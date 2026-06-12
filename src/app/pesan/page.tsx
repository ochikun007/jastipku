"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { OrderRequest } from "@/lib/types";

const TYPEWRITER_TEXTS = [
  "Lagi Mager Keluar? 🛋️",
  "Pengen Jajan tapi Panas? ☀️",
  "Butuh Sesuatu Cepat? ⚡",
  "Biar Jastipku Aja! 🛵"
];

function TypewriterEffect() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = TYPEWRITER_TEXTS[textIndex];
    let typingSpeed = 80; // slightly faster typing
    let active = true;

    if (isDeleting) typingSpeed = 40;

    const handleType = () => {
      if (!active) return;
      if (!isDeleting && displayedText === currentText) {
        setTimeout(() => active && setIsDeleting(true), 2000);
      } else if (isDeleting && displayedText === "") {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % TYPEWRITER_TEXTS.length);
      } else {
        setDisplayedText(currentText.substring(0, displayedText.length + (isDeleting ? -1 : 1)));
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => { active = false; clearTimeout(timer); };
  }, [displayedText, isDeleting, textIndex]);

  return (
    <span className="min-h-[40px] inline-block text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#cc6431] to-[#e43a15]">
      {displayedText}
      <span className="animate-pulse border-r-4 border-[#cc6431] ml-1 text-[#cc6431]">|</span>
    </span>
  );
}

export default function PublicOrderPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
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

  const [reviews, setReviews] = useState<OrderRequest[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    api.getPublicReviews().then(setReviews).catch(console.error);
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

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
    <div className="order-page-container min-h-screen flex justify-center pt-20 pb-28 px-4 relative overflow-hidden bg-gradient-to-br from-[#fff1eb] via-[#fffaf7] to-[#ffece6]">
      {/* GLOWING MESH BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#ffb347] opacity-[0.08] blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#f35b4b] opacity-[0.06] blur-[120px]"></div>
        
        {/* BACKGROUND FLOATING EMOJIS */}
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-[20%] left-[10%] text-6xl opacity-[0.04]">🍔</motion.div>
        <motion.div animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }} className="absolute top-[60%] left-[15%] text-5xl opacity-[0.04]">🥤</motion.div>
        <motion.div animate={{ y: [0, -25, 0], rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }} className="absolute top-[30%] right-[10%] text-6xl opacity-[0.04]">🛍️</motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", delay: 0.5 }} className="absolute top-[70%] right-[15%] text-5xl opacity-[0.04]">🎁</motion.div>
      </div>

      {/* RUNNING BANNER (MARQUEE) */}
      <div className="fixed top-0 left-0 w-full bg-[#cc6431] text-white py-2 z-50 overflow-hidden flex whitespace-nowrap shadow-md">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex shrink-0 w-max"
        >
          {/* We repeat the content a few times to ensure it covers wide screens and loops smoothly */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-8 px-4">
              <span className="flex items-center gap-2">🛵 <span className="font-semibold tracking-wide">Jstipku Siap Antar!</span></span>
              <span className="flex items-center gap-2">⚡ <span className="font-semibold tracking-wide">Pengiriman Cepat</span></span>
              <span className="flex items-center gap-2">💰 <span className="font-semibold tracking-wide">Bayar Tunai di Tempat</span></span>
              <span className="flex items-center gap-2">🍔 <span className="font-semibold tracking-wide">Apapun Kebutuhanmu!</span></span>
            </div>
          ))}
        </motion.div>
      </div>


      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col justify-center items-center text-center w-full max-w-md my-auto"
          >
            <div className="relative mb-8">
              {/* GLOWING AURA */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute inset-0 bg-[#ffb347] rounded-full blur-[30px] z-0"
              ></motion.div>
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -12, 0] }}
                transition={{ 
                  scale: { type: "spring", stiffness: 200, delay: 0.2 },
                  opacity: { delay: 0.2 },
                  y: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 } 
                }}
                className="w-40 h-40 rounded-full shadow-[0_0_40px_rgba(204,100,49,0.3)] overflow-hidden bg-white flex items-center justify-center relative z-10 mx-auto"
              >
                <img src="/logo.png" alt="Jstipku Logo" className="w-full h-full object-cover" />
              </motion.div>
            </div>
            
            <div className="mb-4 h-20 flex items-center justify-center">
              <TypewriterEffect />
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-[#6d5549] text-base mb-10 leading-relaxed px-4"
            >
              Titipin aja ke <strong className="text-[#cc6431]">Jstipku</strong>! Dari beli cemilan kesukaan sampai belanja harian, Jstipku siap beliin dan antar sampai depan pintu. Kamu tinggal duduk manis saja! 🛋️✨
            </motion.p>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0, scale: [1, 1.05, 1] }} 
              transition={{ 
                delay: 0.5, 
                type: "spring",
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 }
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStarted(true)}
              className="w-full max-w-[280px] bg-[linear-gradient(135deg,#ffb347_0%,#ff8c61_48%,#f35b4b_100%)] text-white py-4 px-6 rounded-full font-bold text-lg shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 relative z-10"
            >
              Mulai Order Sekarang 🚀
            </motion.button>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold"
            >
              <div className="flex items-center gap-1.5 px-4 py-2 bg-white/60 backdrop-blur-md border border-[#ffb347]/30 rounded-full text-[#cc6431] shadow-sm">⚡ Cepat</div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-white/60 backdrop-blur-md border border-[#ffb347]/30 rounded-full text-[#cc6431] shadow-sm">💸 Murah</div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-white/60 backdrop-blur-md border border-[#ffb347]/30 rounded-full text-[#cc6431] shadow-sm">✨ Aman</div>
            </motion.div>

            {reviews.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="mt-8 w-full max-w-[300px]"
              >
                <div className="bg-white/80 rounded-2xl p-4 shadow-sm border border-[#f2dfcf]/50 relative overflow-hidden min-h-[100px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentReviewIndex}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-sm" style={{ color: star <= (reviews[currentReviewIndex].review_rating || 5) ? "#ffb347" : "#e6d8cf" }}>★</span>
                        ))}
                      </div>
                      <p className="text-sm text-[#6d5549] italic mb-2 line-clamp-3 leading-relaxed">"{reviews[currentReviewIndex].review_text}"</p>
                      <p className="text-xs font-bold text-[#cc6431] uppercase tracking-wider">— {reviews[currentReviewIndex].customer_name}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="order-page-card w-full max-w-xl p-6 sm:p-8 relative z-10"
          >
        <motion.div 
          className="order-page-header text-center mb-6"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <img src="/logo.png" alt="Jstipku Logo" className="w-full h-auto object-cover max-w-[200px] mx-auto rounded-full shadow-lg shadow-orange-100" />
        </motion.div>

        <div className="order-page-body">
          <h2 className="order-form-heading text-2xl font-bold text-[#2c1c14] mb-2 font-[family:var(--font-display)] text-center">Buat Pesanan Anda</h2>
          <p className="order-form-desc text-sm text-[#8a6a56] mb-6 text-center">Isi form di bawah ini untuk memesan barang yang Anda inginkan. Jastip kami akan segera memproses pesanan Anda!</p>

          {error && <div className="order-form-error mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm font-semibold">{error}</div>}

          <motion.form 
            onSubmit={handleSubmit} 
            className="order-form space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">Nama Lengkap *</label>
              <input
                required
                value={form.customerName}
                onChange={(e) => setForm((c) => ({ ...c, customerName: e.target.value }))}
                placeholder="Nama Anda"
                className="order-form-input w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">Nomor WhatsApp *</label>
              <input
                required
                value={form.customerPhone}
                onChange={(e) => setForm((c) => ({ ...c, customerPhone: e.target.value }))}
                placeholder="0912345678"
                className="order-form-input w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">📝 Daftar Pesanan *</label>
              <textarea
                required
                value={form.requestItems}
                onChange={(e) => setForm((c) => ({ ...c, requestItems: e.target.value }))}
                placeholder="Contoh:&#10;1x Nasi Goreng Spesial&#10;2x Es Teh Manis"
                rows={4}
                className="order-form-textarea w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition resize-none"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">Pilihan Toko (Opsional)</label>
              <input
                value={form.storePreferences}
                onChange={(e) => setForm((c) => ({ ...c, storePreferences: e.target.value }))}
                placeholder="Nama toko / warung (opsional)"
                className="order-form-input w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">📍 Link Google Maps (Alamat Pengiriman) <span className="text-xs font-normal text-gray-500 ml-1">(Opsional)</span></label>
              <input
                value={form.googleMapsLink}
                onChange={(e) => setForm((c) => ({ ...c, googleMapsLink: e.target.value }))}
                placeholder="Tempel link Google Maps Anda"
                className="order-form-input w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="order-form-group">
              <label className="order-form-label block text-sm font-semibold text-[#6d5549] mb-1">Catatan Tambahan</label>
              <input
                value={form.note}
                onChange={(e) => setForm((c) => ({ ...c, note: e.target.value }))}
                placeholder="Pesan khusus (opsional)"
                className="order-form-input w-full px-4 py-3 bg-[#fffaf6] border border-[#f2dfcf] rounded-2xl focus:border-[#cc6431] outline-none transition"
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
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={submitting} 
              className="order-form-submit w-full mt-6 py-4 bg-[linear-gradient(135deg,#ffb347_0%,#ff8c61_48%,#f35b4b_100%)] text-white font-bold rounded-2xl shadow-[0_16px_32px_rgba(228,110,53,0.25)] transition disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Mengirim...
                </span>
              ) : "🚀 Kirim Pesanan"}
            </motion.button>
          </motion.form>
        </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* MOTORCYCLE ASPHALT ANIMATION */}
      <div className="fixed bottom-0 left-0 w-full h-14 bg-[#333] z-[60] flex items-center overflow-hidden shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        {/* Road dashes */}
        <div className="absolute top-1/2 w-full flex justify-between px-2 opacity-60">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-8 h-1 bg-white rounded-full"></div>
          ))}
        </div>
        {/* Moving Motorcycle */}
        <motion.div
          animate={{ x: ["-10vw", "110vw"] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="relative text-3xl z-10 flex items-center"
        >
          <span className="transform -scale-x-100">🛵</span>
          <span className="absolute -left-3 top-2 text-sm opacity-50">💨</span>
        </motion.div>
      </div>
    </div>
  );
}
