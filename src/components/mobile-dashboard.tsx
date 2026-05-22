"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { toJpeg } from "html-to-image";
import {
  ArrowDownCircle,
  BadgePlus,
  BookOpenText,
  Home,
  LogOut,
  PackagePlus,
  ReceiptText,
  RefreshCw,
  Store as StoreIcon,
  Trash2,
  WalletCards,
} from "lucide-react";

type TabId = "home" | "toko" | "produk" | "order" | "kas";

import { InvoiceCard } from "@/components/invoice-card";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Store, LedgerEntry, Order, OrderDetail, OrderRequest, Product, Summary, CreateProductInput, TrackingStatus } from "@/lib/types";
import { logoutAdmin } from "@/app/actions";

const EMPTY_SUMMARY: Summary = {
  total_income: 0,
  total_expense: 0,
  balance: 0,
  total_orders: 0,
  product_count: 0,
};

async function fetchDashboardData() {
  const [summary, stores, products, orders, ledgerEntries, orderRequests] = await Promise.all([
    api.getSummary(),
    api.getStores(),
    api.getProducts(),
    api.getOrders(),
    api.getLedger(),
    api.getOrderRequests(),
  ]);

  return { summary, stores, products, orders, ledgerEntries, orderRequests };
}

type NoticeState = {
  tone: "success" | "error";
  message: string;
} | null;

type StoreFormState = {
  name: string;
  category: string;
  whatsapp_number: string;
  mapsLink: string;
};

type ProductFormState = {
  name: string;
  category: string;
  price: string;
  note: string;
  storeId: string;
  imageFile: File | null;
};

type OrderFormState = {
  customerName: string;
  customerPhone: string;
  shippingCost: string;
  note: string;
  shippingAddressLink: string;
};

type LedgerFormState = {
  entryType: "income" | "expense";
  amount: string;
  category: string;
  description: string;
};

function SectionShell({
  icon,
  title,
  caption,
  children,
}: {
  icon: ReactNode;
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <section className="glass-panel space-y-5 rounded-[30px] p-5 shadow-[0_18px_40px_rgba(73,44,23,0.08)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1df] text-[#c95f1c]">
          {icon}
        </div>
        <div>
          <h2 className="font-[family:var(--font-display)] text-2xl font-semibold text-[#2d1c12]">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6d5549]">{caption}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function MobileDashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>([]);
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);
  const [activeOrder, setActiveOrder] = useState<OrderDetail | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [storeForm, setStoreForm] = useState<StoreFormState>({
    name: "",
    category: "",
    whatsapp_number: "",
    mapsLink: "",
  });
  const [productForm, setProductForm] = useState<ProductFormState>({
    name: "",
    category: "",
    price: "",
    note: "",
    storeId: "",
    imageFile: null,
  });
  const [orderForm, setOrderForm] = useState<OrderFormState>({
    customerName: "",
    customerPhone: "",
    shippingCost: "",
    note: "",
    shippingAddressLink: "",
  });
  const [ledgerForm, setLedgerForm] = useState<LedgerFormState>({
    entryType: "expense",
    amount: "",
    category: "",
    description: "",
  });
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [notice, setNotice] = useState<NoticeState>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  
  const [editingStoreId, setEditingStoreId] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => {
        setNotice(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const data = await fetchDashboardData();
        if (cancelled) {
          return;
        }

        setSummary(data.summary);
        setStores(data.stores);
        setProducts(data.products);
        setOrders(data.orders);
        setLedgerEntries(data.ledgerEntries);
        setOrderRequests(data.orderRequests);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setNotice({
          tone: "error",
          message:
            error instanceof Error ? error.message : "Gagal memuat dashboard.",
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshDashboard(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }
    setNotice(null);

    try {
      const data = await fetchDashboardData();
      setSummary(data.summary);
      setStores(data.stores);
      setProducts(data.products);
      setOrders(data.orders);
      setLedgerEntries(data.ledgerEntries);
      setOrderRequests(data.orderRequests);
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Gagal memuat dashboard.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function openInvoice(orderId: number) {
    try {
      const detail = await api.getOrder(orderId);
      setActiveOrder(detail);
      setNotice({
        tone: "success",
        message: `Nota order #${orderId} siap diunduh.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Gagal memuat detail nota.",
      });
    }
  }

  function setQuantity(productId: number, nextValue: number) {
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(0, nextValue),
    }));
  }

  const selectedProducts = products
    .map((product) => ({
      ...product,
      quantity: quantities[product.id] ?? 0,
    }))
    .filter((product) => product.quantity > 0);

  const existingOrder = editingOrderId ? orders.find((o) => o.id === editingOrderId) : null;
  const subtotal = editingOrderId && existingOrder 
    ? existingOrder.subtotal 
    : selectedProducts.reduce((total, product) => total + product.price * product.quantity, 0);

  const shippingCost = Number(orderForm.shippingCost || 0);
  const estimatedTotal = subtotal + shippingCost;

  function handleCreateStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      void (async () => {
        try {
          const payload = {
            name: storeForm.name,
            category: storeForm.category,
            whatsapp_number: storeForm.whatsapp_number,
            maps_link: storeForm.mapsLink,
          };
          if (editingStoreId) {
            await api.updateStore(editingStoreId, payload);
            setNotice({ tone: "success", message: "Toko berhasil diperbarui." });
            setEditingStoreId(null);
          } else {
            await api.createStore(payload);
            setNotice({ tone: "success", message: "Toko baru berhasil didaftarkan." });
          }
          setStoreForm({ name: "", category: "", whatsapp_number: "", mapsLink: "" });
          await refreshDashboard();
        } catch (error) {
          setNotice({
            tone: "error",
            message: error instanceof Error ? error.message : (error as any)?.message || "Gagal menyimpan toko.",
          });
        }
      })();
    });
  }

  function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      void (async () => {
        try {
          let imageUrl: string | undefined = undefined;
          if (productForm.imageFile) {
            setNotice({ tone: "success", message: "Sedang mengunggah gambar..." });
            imageUrl = await api.uploadImage(productForm.imageFile);
          }

          const payload: Partial<CreateProductInput> = {
            name: productForm.name,
            category: productForm.category,
            price: Number(productForm.price || 0),
            note: productForm.note,
            store_id: productForm.storeId ? Number(productForm.storeId) : null,
          };
          
          if (imageUrl !== undefined) {
            payload.image_url = imageUrl;
          }

          if (editingProductId) {
            await api.updateProduct(editingProductId, payload);
            setNotice({ tone: "success", message: "Produk berhasil diperbarui." });
            setEditingProductId(null);
          } else {
            await api.createProduct(payload as CreateProductInput);
            setNotice({ tone: "success", message: "Produk baru berhasil ditambahkan." });
          }

          setProductForm({ name: "", category: "", price: "", note: "", storeId: "", imageFile: null });
          await refreshDashboard();
        } catch (error) {
          setNotice({
            tone: "error",
            message: error instanceof Error ? error.message : (error as any)?.message || "Gagal menyimpan produk.",
          });
        }
      })();
    });
  }

  function handleDeleteProduct(productId: number) {
    startTransition(() => {
      void (async () => {
        try {
          await api.deleteProduct(productId);
          setQuantities((current) => {
            const next = { ...current };
            delete next[productId];
            return next;
          });
          await refreshDashboard();
          setNotice({
            tone: "success",
            message: "Produk berhasil dihapus.",
          });
        } catch (error) {
          setNotice({
            tone: "error",
            message:
              (error as any)?.message || "Gagal menghapus produk.",
          });
        }
      })();
    });
  }

  function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      void (async () => {
        try {
          if (editingOrderId) {
            const existingOrder = orders.find((o) => o.id === editingOrderId);
            if (!existingOrder) throw new Error("Order tidak ditemukan");
            
            await api.updateOrder(editingOrderId, {
              customer_name: orderForm.customerName,
              customer_phone: orderForm.customerPhone || null,
              shipping_cost: Number(orderForm.shippingCost || 0),
              note: orderForm.note,
              shipping_address_link: orderForm.shippingAddressLink,
              subtotal: existingOrder.subtotal,
            });
            setNotice({ tone: "success", message: "Order berhasil diperbarui." });
            setEditingOrderId(null);
          } else {
            const detail = await api.createOrder({
              customer_name: orderForm.customerName,
              customer_phone: orderForm.customerPhone || null,
              shipping_cost: Number(orderForm.shippingCost || 0),
              note: orderForm.note,
              shipping_address_link: orderForm.shippingAddressLink,
              items: selectedProducts.map((p) => ({
                product_id: p.id,
                quantity: p.quantity,
              })),
            });
            setActiveOrder(detail);

            // Auto-link to customer request if this order came from "Proses Order Ini"
            if (processingRequestId) {
              await api.linkRequestToOrder(processingRequestId, detail.order.id);
              setProcessingRequestId(null);
            }

            setNotice({ tone: "success", message: "Order berhasil disimpan dan siap diunduh." });
          }

          setOrderForm({ customerName: "", customerPhone: "", shippingCost: "0", note: "", shippingAddressLink: "" });
          setQuantities({});
          await refreshDashboard();
        } catch (error) {
          setNotice({
            tone: "error",
            message: (error as any)?.message || "Gagal menyimpan order.",
          });
        }
      })();
    });
  }

  function handleUpdateOrderStatus(orderId: number, status: "active" | "completed" | "cancelled") {
    startTransition(() => {
      void (async () => {
        try {
          await api.updateOrderStatus(orderId, status);
          await refreshDashboard(false); // background refresh
          const statusText = status === "completed" ? "Selesai" : status === "cancelled" ? "Dibatalkan" : "Aktif";
          setNotice({
            tone: "success",
            message: `Status order #${orderId} berhasil diubah menjadi ${statusText}.`,
          });
        } catch (error) {
          setNotice({
            tone: "error",
            message: (error as any)?.message || "Gagal mengubah status order.",
          });
        }
      })();
    });
  }

  function handleDeleteOrder(orderId: number) {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus order #${orderId} secara permanen? Pemasukan di Kas juga akan terhapus.`)) return;

    startTransition(() => {
      void (async () => {
        try {
          await api.deleteOrder(orderId);
          await refreshDashboard();
          setNotice({
            tone: "success",
            message: `Order #${orderId} berhasil dihapus permanen.`,
          });
        } catch (error) {
          setNotice({
            tone: "error",
            message: (error as any)?.message || "Gagal menghapus order.",
          });
        }
      })();
    });
  }

  function handleGenerateLink() {
    startTransition(() => {
      void (async () => {
        try {
          const req = await api.generateOrderRequest();
          const link = `${window.location.origin}/order/${req.request_code}`;
          setGeneratedLink(link);
          await navigator.clipboard.writeText(link);
          await refreshDashboard(false);
          setNotice({
            tone: "success",
            message: "Link berhasil dibuat dan disalin ke clipboard!",
          });
        } catch (error) {
          setNotice({
            tone: "error",
            message: (error as any)?.message || "Gagal membuat link.",
          });
        }
      })();
    });
  }

  function handleProcessRequest(request: OrderRequest) {
    // Auto-fill order form with request data AND store request ID for linking
    setProcessingRequestId(request.id);
    setOrderForm({
      customerName: request.customer_name || "",
      customerPhone: request.customer_phone || "",
      shippingCost: "0",
      note: `Pesanan: ${request.request_items || ""}\nToko: ${request.store_preferences || "-"}${request.note ? `\nCatatan Tambahan: ${request.note}` : ""}`,
      shippingAddressLink: request.google_maps_link || "",
    });
    setActiveTab("order");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setNotice({
      tone: "success",
      message: `Data request ${request.customer_name} telah diisi otomatis ke form Order.`,
    });
  }

  function handleUpdateTracking(requestId: number, trackingStatus: TrackingStatus) {
    startTransition(() => {
      void (async () => {
        try {
          await api.updateTrackingStatus(requestId, trackingStatus);
          await refreshDashboard(false);
          setNotice({
            tone: "success",
            message: `Status tracking berhasil diperbarui.`,
          });
        } catch (error) {
          setNotice({
            tone: "error",
            message: (error as any)?.message || "Gagal memperbarui tracking.",
          });
        }
      })();
    });
  }

  const TRACKING_OPTIONS: { key: TrackingStatus; label: string }[] = [
    { key: "pending", label: "Pesanan Dibuat" },
    { key: "accepted", label: "Pesanan Diterima" },
    { key: "heading_to_store", label: "Menuju Toko" },
    { key: "picking_up", label: "Mengambil Pesanan" },
    { key: "ready_to_deliver", label: "Siap Antar" },
    { key: "delivering", label: "Mengantar" },
    { key: "arrived", label: "Sudah Sampai" },
    { key: "completed", label: "Selesai" },
  ];

  const pendingRequests = orderRequests.filter((r) => r.status === "pending");
  const processingRequests = orderRequests.filter((r) => r.status === "processing");

  function handleCreateLedgerEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      void (async () => {
        try {
          await api.createLedgerEntry({
            entry_type: ledgerForm.entryType,
            amount: Number(ledgerForm.amount || 0),
            category: ledgerForm.category,
            description: ledgerForm.description,
          });

          setLedgerForm({
            entryType: "expense",
            amount: "",
            category: "",
            description: "",
          });
          await refreshDashboard();
          setNotice({
            tone: "success",
            message: "Catatan kas berhasil disimpan.",
          });
        } catch (error) {
          setNotice({
            tone: "error",
            message:
              (error as any)?.message || "Gagal mencatat kas.",
          });
        }
      })();
    });
  }

  async function downloadInvoice() {
    if (!activeOrder || !invoiceRef.current) {
      return;
    }

    try {
      await document.fonts.ready;

      const dataUrl = await toJpeg(invoiceRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: "#f5f5f5",
        quality: 0.95,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `nota-order-${activeOrder.order.id}.jpg`;
      link.click();

      setNotice({
        tone: "success",
        message: "Nota berhasil diunduh sebagai gambar JPG.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Gagal mengunduh nota.",
      });
    }
  }

  const navItems: { id: TabId; label: string; icon: ReactNode }[] = [
    { id: "home", label: "Beranda", icon: <Home className="h-5 w-5" /> },
    { id: "toko", label: "Toko", icon: <StoreIcon className="h-5 w-5" /> },
    { id: "produk", label: "Produk", icon: <PackagePlus className="h-5 w-5" /> },
    { id: "order", label: "Order", icon: <WalletCards className="h-5 w-5" /> },
    { id: "kas", label: "Kas", icon: <BookOpenText className="h-5 w-5" /> },
  ];

  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled");

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[460px] flex-col px-4 pb-28 pt-5 text-[#2f2118] sm:px-6">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] rounded-b-[48px] bg-[radial-gradient(circle_at_top,_rgba(255,176,111,0.34),_transparent_58%),linear-gradient(180deg,_#fff8f1_0%,_rgba(255,248,241,0)_100%)]" />

      {notice ? (
        <div className="fixed left-0 right-0 top-4 z-[100] mx-auto w-full max-w-[420px] px-4 animate-[fadeIn_0.3s_ease]">
          <div
            className={`rounded-[22px] border px-4 py-3 text-sm leading-6 shadow-xl ${
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            {notice.message}
          </div>
        </div>
      ) : null}

      {/* ─── TAB: BERANDA ─── */}
      {activeTab === "home" && (
        <div className="space-y-5 animate-[fadeIn_0.2s_ease]">
          <header className="rounded-[36px] bg-[linear-gradient(145deg,rgba(255,171,94,0.92),rgba(241,92,74,0.92))] px-5 pb-6 pt-6 text-white shadow-[0_24px_64px_rgba(211,104,48,0.28)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.36em] text-white/80">
                  Dashboard
                </p>
                <h1 className="mt-3 font-[family:var(--font-display)] text-4xl font-semibold leading-[0.95]">
                  Titip Barang
                  <br />
                  JSTIPKU
                </h1>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void logoutAdmin()}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-rose-500/80 text-white transition hover:bg-rose-600"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void refreshDashboard()}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Refresh data"
                  title="Refresh Dashboard"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[28px] bg-white/18 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Laba (Ongkir)
                </p>
                <p className="mt-2 font-[family:var(--font-display)] text-2xl font-semibold">
                  {formatCurrency(summary.balance)}
                </p>
              </div>
              <div className="rounded-[28px] bg-[#2f190f]/26 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Order
                </p>
                <p className="mt-2 font-[family:var(--font-display)] text-3xl font-semibold">
                  {summary.total_orders}
                </p>
              </div>
              <div className="rounded-[28px] bg-white/18 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Masuk
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(summary.total_income)}
                </p>
              </div>
              <div className="rounded-[28px] bg-white/18 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Keluar
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(summary.total_expense)}
                </p>
              </div>
            </div>
          </header>

          {/* Generate Link Section */}
          <SectionShell
            icon={<BadgePlus className="h-5 w-5" />}
            title="Link Order Pelanggan"
            caption="Share link publik universal untuk promosi, atau generate link spesifik (private) untuk pelanggan tertentu."
          >
            <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 mb-2">Link Publik (Sebar ke Medsos):</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value="https://jstipku.online/pesan"
                  className="flex-1 rounded-xl bg-white border border-orange-200 px-3 py-2 text-sm text-orange-900 font-mono"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={() => { void navigator.clipboard.writeText("https://jstipku.online/pesan"); setNotice({ tone: "success", message: "Link disalin!" }); }}
                  className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition shrink-0"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </SectionShell>

          {/* Pending Request Queue */}
          {pendingRequests.length > 0 && (
            <SectionShell
              icon={<ReceiptText className="h-5 w-5" />}
              title={`Antrian Request (${pendingRequests.length})`}
              caption="Pesanan pelanggan yang masuk dari link. Klik 'Proses' untuk mengisi form order otomatis."
            >
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="rounded-[24px] border-2 border-amber-300 bg-amber-50 px-4 py-4">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-800">Baru</span>
                      {req.order_number && <span className="text-xs font-bold text-[#cc6431]">#{req.order_number}</span>}
                      <p className="font-semibold text-[#2c1c14]">{req.customer_name}</p>
                    </div>
                    <p className="text-sm text-[#6d5549]">📱 {req.customer_phone}</p>
                    {req.request_items && (
                      <div className="mt-2 bg-white/60 rounded-xl p-3 border border-amber-200/50">
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">Pesanan:</p>
                        <p className="text-sm text-[#4a332a] whitespace-pre-line">{req.request_items}</p>
                      </div>
                    )}
                    {req.store_preferences && (
                      <p className="mt-2 text-sm text-[#8a6a56]">🏪 Toko: {req.store_preferences}</p>
                    )}
                    {req.google_maps_link && (
                      <a href={req.google_maps_link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#cc6431] hover:underline">
                        📍 Lihat Lokasi
                      </a>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const waLink = `https://wa.me/${req.customer_phone ? req.customer_phone.replace(/^0/, "62") : ""}?text=${encodeURIComponent(`Halo ${req.customer_name}, saya dari Jstipku. Ada pesanan yang ingin saya konfirmasi.`)}`;
                          window.open(waLink, "_blank");
                        }}
                        className="rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 text-center flex-1"
                      >
                        Hubungi via WA
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProcessRequest(req)}
                        className="flex-[1.5] rounded-full bg-[#2d1d14] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e140e] text-center"
                      >
                        Proses Order Ini
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>
          )}

          {/* Processing Requests — Tracking Controls */}
          {processingRequests.length > 0 && (
            <SectionShell
              icon={<ReceiptText className="h-5 w-5" />}
              title={`Tracking Aktif (${processingRequests.length})`}
              caption="Update status tracking agar pelanggan bisa melihat progres pesanan mereka."
            >
              <div className="space-y-3">
                {processingRequests.map((req) => (
                  <div key={req.id} className="rounded-[24px] border border-[#f2dfcf] bg-white px-4 py-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {req.order_number && <span className="text-xs font-bold text-[#cc6431]">#{req.order_number}</span>}
                        <p className="font-semibold text-[#2c1c14]">{req.customer_name}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                        {TRACKING_OPTIONS.find((t) => t.key === req.tracking_status)?.label || req.tracking_status}
                      </span>
                    </div>
                    <p className="text-sm text-[#8a6a56] mb-3">📱 {req.customer_phone} • 🛒 {req.request_items?.split("\n")[0]}...</p>
                    <div className="flex flex-wrap gap-1.5">
                      {TRACKING_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          disabled={isPending || opt.key === req.tracking_status}
                          onClick={() => handleUpdateTracking(req.id, opt.key)}
                          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                            opt.key === req.tracking_status
                              ? "bg-[#cc6431] text-white"
                              : "bg-[#fff3e1] text-[#8a6a56] hover:bg-[#ffe5c7]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>
          )}

          <SectionShell
            icon={<ReceiptText className="h-5 w-5" />}
            title="Order Terbaru"
            caption="Buka kembali detail order kapan saja untuk melihat ringkasan dan membuat nota PNG lagi."
          >
            {activeOrders.length === 0 ? (
              <p className="empty-state">
                Belum ada order aktif.
              </p>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[24px] border border-[#f2dfcf] bg-white px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[#2c1c14] truncate">
                            #{order.id} • {order.customer_name}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'completed' ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {order.status === 'completed' ? 'Selesai' : 'Aktif'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#6d5549]">
                          {formatDateTime(order.created_at)}
                        </p>
                        
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="mt-3 bg-[#fffaf6] rounded-xl p-3 border border-[#f2dfcf]/50">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#8a6a56] mb-2">Daftar Pesanan:</p>
                            <ul className="space-y-1">
                              {order.order_items.map((item, idx) => (
                                <li key={idx} className="text-sm text-[#4a332a] flex justify-between">
                                  <span className="truncate mr-2">{item.quantity}x {item.product_name}</span>
                                  <span className="font-medium text-[#8a6a56] shrink-0">{formatCurrency(item.line_total)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="mt-3 text-sm font-semibold text-[#8a6a56]">
                          Total: <span className="text-[#cc6431]">{formatCurrency(order.total_amount)}</span> (Ongkir {formatCurrency(order.shipping_cost)})
                        </p>

                        {order.shipping_address_link && (
                          <div className="mt-3">
                            <a 
                              href={order.shipping_address_link} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#fff0e6] px-4 py-3 text-sm font-semibold text-[#cc6431] transition hover:bg-[#ffe5d4]"
                            >
                              📍 Buka Lokasi di Peta
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {order.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, "completed")}
                            className="rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 text-center"
                          >
                            Tandai Selesai
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, "active")}
                            className="rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 text-center"
                          >
                            Tandai Aktif
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOrderId(order.id);
                            setOrderForm({
                              customerName: order.customer_name,
                              customerPhone: order.customer_phone || "",
                              shippingCost: order.shipping_cost.toString(),
                              note: order.note || "",
                              shippingAddressLink: order.shipping_address_link || "",
                            });
                            setActiveTab("order");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-200 text-center"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void openInvoice(order.id)}
                          className="rounded-full bg-[#2d1d14] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e140e] text-center"
                        >
                          Buka nota
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const waLink = `https://wa.me/${order.customer_phone ? order.customer_phone.replace(/^0/, "62") : ""}?text=${encodeURIComponent(`Halo ${order.customer_name}, pesanan Jastip kamu sedang diproses! Pantau posisinya secara live di sini: https://jstipku.online/order/${order.id}`)}`;
                            window.open(waLink, "_blank");
                          }}
                          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 text-center flex items-center justify-center gap-2"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Hubungi Pelanggan
                        </button>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                            className="flex-1 rounded-full border border-rose-300 bg-rose-50 px-2 py-2 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100 text-center uppercase tracking-wide"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="flex-1 rounded-full bg-rose-600 px-2 py-2 text-[11px] font-semibold text-white transition hover:bg-rose-700 text-center flex items-center justify-center"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionShell>

          <SectionShell
            icon={<ReceiptText className="h-5 w-5" />}
            title="Nota PNG"
            caption="Nota pelanggan ditampilkan sebagai kartu bergaya invoice dan bisa diunduh sebagai gambar."
          >
            {activeOrder ? (
              <div className="space-y-4">
                <InvoiceCard ref={invoiceRef} order={activeOrder} />
                <button
                  type="button"
                  onClick={() => void downloadInvoice()}
                  className="action-button"
                >
                  <ArrowDownCircle className="h-4 w-4" />
                  Unduh nota gambar
                </button>
              </div>
            ) : (
              <p className="empty-state">
                Belum ada nota aktif. Buat order baru atau buka salah satu order terbaru di atas.
              </p>
            )}
          </SectionShell>

          <SectionShell
            icon={<ReceiptText className="h-5 w-5" />}
            title="Riwayat Order (Selesai & Batal)"
            caption="Daftar pesanan yang sudah diselesaikan atau dibatalkan."
          >
            {completedOrders.length === 0 ? (
              <p className="empty-state">
                Belum ada riwayat order.
              </p>
            ) : (
              <div className="space-y-3">
                {completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[24px] border border-[#e6d8cf] bg-[#f9f5f2] px-4 py-4 opacity-80 transition hover:opacity-100"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[#5a463d] truncate">
                            #{order.id} • {order.customer_name}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-gray-200 text-gray-600'}`}>
                            {order.status === 'cancelled' ? 'Batal' : 'Selesai'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#8a6a56]">
                          {formatDateTime(order.created_at)}
                        </p>

                        {order.order_items && order.order_items.length > 0 && (
                          <div className="mt-3 bg-white/50 rounded-xl p-3 border border-[#f2dfcf]/50">
                            <ul className="space-y-1">
                              {order.order_items.map((item, idx) => (
                                <li key={idx} className="text-sm text-[#6d5549] flex justify-between">
                                  <span className="truncate mr-2">{item.quantity}x {item.product_name}</span>
                                  <span className="shrink-0">{formatCurrency(item.line_total)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="mt-3 text-sm font-semibold text-[#8a6a56]">
                          Total: <span className="text-[#8a6a56]">{formatCurrency(order.total_amount)}</span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {order.status === 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, "active")}
                            className="rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 text-center"
                          >
                            Kembalikan Aktif
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void openInvoice(order.id)}
                          className="rounded-full border border-[#d1baa7] px-4 py-2 text-sm font-semibold text-[#5a463d] transition hover:bg-[#e6d8cf] text-center"
                        >
                          Lihat Nota
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 text-center"
                        >
                          Hapus Permanen
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionShell>
        </div>
      )}

      {/* ─── TAB: TOKO ─── */}
      {activeTab === "toko" && (
        <div className="space-y-5 animate-[fadeIn_0.2s_ease]">
        <SectionShell
          icon={<StoreIcon className="h-5 w-5" />}
          title="Toko"
          caption="Daftarkan toko langganan Anda beserta kontak WhatsApp-nya."
        >
          <form className="space-y-3" onSubmit={handleCreateStore}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={storeForm.name}
                onChange={(event) => setStoreForm((cur) => ({ ...cur, name: event.target.value }))}
                placeholder="Nama Toko"
                className="input-shell"
                required
              />
              <input
                value={storeForm.category}
                onChange={(event) => setStoreForm((cur) => ({ ...cur, category: event.target.value }))}
                placeholder="Kategori (Mis. Sepatu)"
                className="input-shell"
                required
              />
            </div>
            <input
              value={storeForm.whatsapp_number}
              onChange={(event) => setStoreForm((cur) => ({ ...cur, whatsapp_number: event.target.value }))}
              placeholder="Nomor WA (opsional)"
              className="input-shell"
            />
            <input
              value={storeForm.mapsLink}
              onChange={(event) => setStoreForm((cur) => ({ ...cur, mapsLink: event.target.value }))}
              placeholder="Link Google Maps Toko (opsional)"
              className="input-shell"
            />
            <button
              type="submit"
              disabled={isPending || !storeForm.name.trim()}
              className="action-button"
            >
              <BadgePlus className="h-4 w-4" />
              {editingStoreId ? "Simpan Perubahan" : "Tambah Toko"}
            </button>
            {editingStoreId && (
              <button
                type="button"
                onClick={() => {
                  setEditingStoreId(null);
                  setStoreForm({ name: "", category: "", whatsapp_number: "", mapsLink: "" });
                }}
                className="w-full mt-2 rounded-full border border-[#cc6431] py-3 text-sm font-semibold text-[#cc6431] transition hover:bg-[#fff1e8]"
              >
                Batal Edit
              </button>
            )}
          </form>
          {stores.length > 0 && (
            <div className="space-y-3">
              {stores.map((store) => (
                <div key={store.id} className="flex items-center justify-between rounded-[24px] border border-[#f2dfcf] bg-[#fffaf6] px-4 py-3">
                  <div>
                    <p className="font-semibold text-[#2c1c14]">{store.name}</p>
                    <p className="text-xs text-[#8a6a56]">{store.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStoreId(store.id);
                        setStoreForm({
                          name: store.name,
                          category: store.category,
                          whatsapp_number: store.whatsapp_number || "",
                          mapsLink: store.maps_link || "",
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-200"
                    >
                      Edit
                    </button>
                    {store.maps_link && (
                      <a
                        href={store.maps_link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                      >
                        Peta
                      </a>
                    )}
                    {store.whatsapp_number && (
                      <a
                        href={`https://wa.me/${store.whatsapp_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200"
                      >
                        WA
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionShell>
        </div>
      )}

      {/* ─── TAB: PRODUK ─── */}
      {activeTab === "produk" && (
        <div className="space-y-5 animate-[fadeIn_0.2s_ease]">
        <SectionShell
          icon={<PackagePlus className="h-5 w-5" />}
          title="Produk"
          caption="Tambah produk beserta harga satuan, lalu hapus produk yang sudah tidak dipakai."
        >
          <form className="space-y-3" onSubmit={handleCreateProduct}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Nama produk"
                className="input-shell"
                required
              />
              <input
                value={productForm.category}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                placeholder="Kategori (misal: Makanan, Skincare)"
                className="input-shell"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={productForm.price}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="Harga"
                type="number"
                min="0"
                className="input-shell"
                required
              />
              <select
                value={productForm.storeId}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    storeId: event.target.value,
                  }))
                }
                className="input-shell"
              >
                <option value="">Pilih Toko (Opsional)</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-3 rounded-[20px] bg-[#fffaf6] px-4 py-2 border border-[#f2dfcf]">
              <label className="text-sm font-medium text-[#6d5549] shrink-0">Gambar Produk</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    imageFile: event.target.files?.[0] || null,
                  }))
                }
                className="block w-full text-sm text-[#8a6a56] file:mr-3 file:rounded-full file:border-0 file:bg-[#fff1df] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#c95f1c] hover:file:bg-[#ffe5d7]"
              />
            </div>
            <input
              value={productForm.note}
              onChange={(event) =>
                setProductForm((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
              placeholder="Catatan produk"
              className="input-shell"
            />

            <button
              type="submit"
              disabled={isPending || !productForm.name.trim() || !productForm.price.trim() || (!editingProductId && !productForm.category.trim())}
              className="action-button"
            >
              <BadgePlus className="h-4 w-4" />
              {editingProductId ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
            {editingProductId && (
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setProductForm({ name: "", category: "", price: "", note: "", storeId: "", imageFile: null });
                }}
                className="w-full mt-2 rounded-full border border-[#cc6431] py-3 text-sm font-semibold text-[#cc6431] transition hover:bg-[#fff1e8]"
              >
                Batal Edit
              </button>
            )}
          </form>

          <div className="space-y-6">
            {products.length === 0 ? (
              <p className="empty-state">
                Belum ada produk. Tambahkan dulu agar bisa dipilih saat membuat order.
              </p>
            ) : (
              Object.entries(
                products.reduce((acc, product) => {
                  const category = product.category || 'Umum';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(product);
                  return acc;
                }, {} as Record<string, typeof products>)
              ).map(([category, categoryProducts]) => (
                <div key={category} className="space-y-3">
                  <button 
                    type="button" 
                    onClick={() => toggleCategory(`product_${category}`)}
                    className="flex w-full items-center justify-between px-2"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8a6a56]">
                      {category}
                    </h3>
                    <span className="text-[#8a6a56] text-xs font-bold">
                      {collapsedCategories[`product_${category}`] ? "▼" : "▲"}
                    </span>
                  </button>
                  {!collapsedCategories[`product_${category}`] && (
                    <div className="space-y-3">
                      {categoryProducts.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-[24px] border border-[#f2dfcf] bg-white px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {product.image_url && (
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#f2dfcf] bg-[#fffaf6]">
                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-[#2c1c14]">{product.name}</p>
                                {product.stores?.name && (
                                  <span className="rounded-full bg-[#f2dfcf] px-2 py-0.5 text-[10px] font-semibold text-[#8a6a56]">
                                    {product.stores.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-[#6d5549]">
                                {formatCurrency(product.price)}
                              </p>
                              {product.note ? (
                                <p className="mt-2 text-sm leading-6 text-[#8a6a56]">
                                  {product.note}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProductId(product.id);
                                setProductForm({
                                  name: product.name,
                                  category: product.category || "",
                                  price: product.price.toString(),
                                  note: product.note || "",
                                  storeId: product.store_id ? product.store_id.toString() : "",
                                  imageFile: null,
                                });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f4ff] text-[#0066cc] transition hover:bg-[#cce5ff]"
                              aria-label={`Edit ${product.name}`}
                            >
                              <span className="text-xs">✏️</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1e8] text-[#cc6431] transition hover:bg-[#ffe5d7]"
                              aria-label={`Hapus ${product.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              ))
            )}
          </div>
        </SectionShell>
        </div>
      )}

      {/* ─── TAB: ORDER ─── */}
      {activeTab === "order" && (
        <div className="space-y-5 animate-[fadeIn_0.2s_ease]">
        <SectionShell
          icon={<WalletCards className="h-5 w-5" />}
          title="Buat Order"
          caption="Pilih produk, atur jumlah, tambahkan ongkir, lalu simpan order untuk pelanggan."
        >
          <form className="space-y-4" onSubmit={handleCreateOrder}>
            <input
              value={orderForm.customerName}
              onChange={(event) =>
                setOrderForm((current) => ({
                  ...current,
                  customerName: event.target.value,
                }))
              }
              placeholder="Nama Pelanggan"
              className="input-shell"
              required
            />
            <input
              value={orderForm.customerPhone}
              onChange={(event) =>
                setOrderForm((current) => ({
                  ...current,
                  customerPhone: event.target.value,
                }))
              }
              placeholder="No. HP Pelanggan (Otomatis jika dari antrian)"
              className="input-shell"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={orderForm.shippingCost}
                onChange={(event) =>
                  setOrderForm((current) => ({
                    ...current,
                    shippingCost: event.target.value,
                  }))
                }
                placeholder="Ongkir"
                type="number"
                min="0"
                className="input-shell"
              />
              <input
                value={orderForm.note}
                onChange={(event) =>
                  setOrderForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
                placeholder="Catatan order"
                className="input-shell"
              />
            </div>

            <input
              value={orderForm.shippingAddressLink}
              onChange={(event) =>
                setOrderForm((current) => ({
                  ...current,
                  shippingAddressLink: event.target.value,
                }))
              }
              placeholder="Teks Alamat Lengkap (Bukan Link Pendek)"
              className="input-shell"
            />

            {!editingOrderId && (
              <div className="space-y-6">
                {products.length === 0 ? (
                  <p className="empty-state">
                    Tambahkan produk terlebih dulu sebelum membuat order.
                  </p>
                ) : (
                  Object.entries(
                    products.reduce((acc, product) => {
                      const category = product.category || 'Umum';
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(product);
                      return acc;
                    }, {} as Record<string, typeof products>)
                  ).map(([category, categoryProducts]) => (
                    <div key={category} className="space-y-3">
                      <button 
                        type="button" 
                        onClick={() => toggleCategory(`order_${category}`)}
                        className="flex w-full items-center justify-between px-2"
                      >
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8a6a56]">
                          {category}
                        </h3>
                        <span className="text-[#8a6a56] text-xs font-bold">
                          {collapsedCategories[`order_${category}`] ? "▼" : "▲"}
                        </span>
                      </button>
                      {!collapsedCategories[`order_${category}`] && (
                        <div className="space-y-3">
                          {categoryProducts.map((product) => {
                            const quantity = quantities[product.id] ?? 0;

                          return (
                            <div
                              key={product.id}
                              className="rounded-[24px] border border-[#f2dfcf] bg-[#fffaf6] px-4 py-4"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-semibold">{product.name}</p>
                                  <p className="mt-1 text-sm text-[#6d5549]">
                                    {formatCurrency(product.price)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 rounded-full bg-white px-2 py-2 shadow-[0_10px_24px_rgba(111,74,43,0.08)]">
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(product.id, quantity - 1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3e1] text-lg font-semibold text-[#bf5f1e]"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={quantity}
                                    onChange={(event) =>
                                      setQuantity(product.id, parseInt(event.target.value) || 0)
                                    }
                                    className="w-10 bg-transparent text-center text-lg font-semibold outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(product.id, quantity + 1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffab5e] text-lg font-semibold text-white shadow-md shadow-[#ffab5e]/40"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
              <div className="rounded-[28px] bg-[linear-gradient(145deg,rgba(255,171,94,0.1),rgba(241,92,74,0.1))] p-5 border border-[#ffab5e]/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-[#8a6a56]">Subtotal Produk</span>
                  <span className="font-semibold text-[#2c1c14]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-[#8a6a56]">Ongkos Kirim</span>
                  <span className="font-semibold text-[#2c1c14]">{formatCurrency(parseInt(orderForm.shippingCost) || 0)}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#ffab5e]/20">
                  <span className="font-bold text-[#cc6431]">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-[#cc6431]">{formatCurrency(subtotal + (parseInt(orderForm.shippingCost) || 0))}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || (!editingOrderId && subtotal === 0)}
                className="action-button"
              >
                <BadgePlus className="h-4 w-4" />
                {editingOrderId ? "Simpan Perubahan Order" : "Simpan Order Baru"}
              </button>
              {editingOrderId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingOrderId(null);
                    setOrderForm({ customerName: "", customerPhone: "", shippingCost: "0", note: "", shippingAddressLink: "" });
                    setQuantities({});
                  }}
                  className="w-full rounded-full border border-[#cc6431] py-3 text-sm font-semibold text-[#cc6431] transition hover:bg-[#fff1e8]"
                >
                  Batal Edit Order
                </button>
              )}
            </form>
          </SectionShell>
        </div>
      )}

      {/* ─── TAB: KAS ─── */}
      {activeTab === "kas" && (
        <div className="space-y-5 animate-[fadeIn_0.2s_ease]">
        <SectionShell
          icon={<WalletCards className="h-5 w-5" />}
          title="Kas Masuk & Keluar"
          caption="Catat pengeluaran operasional atau pemasukan tambahan agar saldo tetap akurat."
        >
          <form className="space-y-3" onSubmit={handleCreateLedgerEntry}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                value={ledgerForm.entryType}
                onChange={(event) =>
                  setLedgerForm((current) => ({
                    ...current,
                    entryType: event.target.value as "income" | "expense",
                  }))
                }
                className="input-shell"
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
              <input
                value={ledgerForm.amount}
                onChange={(event) =>
                  setLedgerForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="Nominal"
                type="number"
                min="0"
                className="input-shell"
                required
              />
            </div>

            <input
              value={ledgerForm.category}
              onChange={(event) =>
                setLedgerForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              placeholder="Kategori, contoh: bensin / tambahan saldo"
              className="input-shell"
              required
            />
            <input
              value={ledgerForm.description}
              onChange={(event) =>
                setLedgerForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Catatan singkat"
              className="input-shell"
            />

            <button type="submit" disabled={isPending} className="action-button">
              <BadgePlus className="h-4 w-4" />
              Simpan kas
            </button>
          </form>

          <div className="space-y-3">
            {ledgerEntries.length === 0 ? (
              <p className="empty-state">
                Belum ada catatan kas. Order baru otomatis menjadi pemasukan.
              </p>
            ) : (
              ledgerEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-4 rounded-[24px] border border-[#f2dfcf] bg-white px-4 py-4"
                >
                  <div>
                    <p className="font-semibold">{entry.category}</p>
                    <p className="mt-1 text-sm text-[#6d5549]">
                      {entry.entry_type === "income" ? "Pemasukan" : "Pengeluaran"} •{" "}
                      {entry.source === "order" ? "otomatis dari order" : "manual"}
                    </p>
                    {entry.description ? (
                      <p className="mt-2 text-sm leading-6 text-[#8a6a56]">
                        {entry.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#b08770]">
                      {formatDateTime(entry.happened_at)}
                    </p>
                  </div>
                  <p
                    className={`text-right font-semibold ${
                      entry.entry_type === "income"
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {entry.entry_type === "income" ? "+" : "-"}
                    {formatCurrency(entry.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </SectionShell>
        </div>
      )}

      {/* ─── BOTTOM NAVIGATION BAR ─── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[460px]">
        <div className="mx-4 mb-4 flex items-center justify-around rounded-[28px] border border-white/20 bg-[#2b1d14]/95 px-2 py-2 shadow-[0_-8px_40px_rgba(43,29,20,0.25)] backdrop-blur-xl sm:mx-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-t from-[#ff8c50] to-[#ffb347] text-white shadow-lg shadow-orange-500/30"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
