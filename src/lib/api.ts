import { supabase } from "./supabase";
import type {
  Store,
  CreateLedgerInput,
  CreateOrderInput,
  CreateProductInput,
  LedgerEntry,
  Order,
  OrderDetail,
  OrderItem,
  OrderRequest,
  Product,
  SubmitOrderRequestInput,
  Summary,
  TrackingStatus,
} from "@/lib/types";

function generateCode(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  for (const byte of arr) {
    result += chars[byte % chars.length];
  }
  return result;
}

export const api = {
  getSummary: async (): Promise<Summary> => {
    const { data, error } = await supabase.from("summary_view").select("*").single();
    if (error) throw error;
    return data as Summary;
  },

  getStores: async (): Promise<Store[]> => {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data as Store[];
  },

  createStore: async (input: { name: string; category: string; whatsapp_number?: string; maps_link?: string }): Promise<Store> => {
    const { data, error } = await supabase
      .from("stores")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as Store;
  },

  uploadImage: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product_images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product_images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*, stores(name)")
      .order("id", { ascending: false });
    if (error) throw error;
    return data as Product[];
  },

  createProduct: async (payload: CreateProductInput): Promise<Product> => {
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  updateProduct: async (id: number, input: Partial<CreateProductInput>): Promise<Product> => {
    const { data, error } = await supabase
      .from("products")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  deleteProduct: async (id: number): Promise<void> => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("id", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data as Order[];
  },

  getOrder: async (id: number): Promise<OrderDetail> => {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();
    if (orderError) throw orderError;

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("id", { ascending: true });
    if (itemsError) throw itemsError;

    return { order: order as Order, items: items as OrderItem[] };
  },

  createOrder: async (payload: CreateOrderInput): Promise<OrderDetail> => {
    const productIds = payload.items.map((i) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError) throw productsError;
    if (!products || products.length === 0) throw new Error("Products not found");

    const productMap = new Map<number, Product>(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const itemsData = payload.items.map((item) => {
      const product = productMap.get(item.product_id);
      if (!product) throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`);

      const unit_price = item.unit_price ?? product.price;
      const line_total = unit_price * item.quantity;
      subtotal += line_total;

      return {
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price,
        line_total,
      };
    });

    const total_amount = subtotal + payload.shipping_cost;

    // 1. Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone || null,
        shipping_cost: payload.shipping_cost,
        subtotal,
        total_amount,
        note: payload.note || null,
        shipping_address_link: payload.shipping_address_link || null,
        status: "active",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items
    const finalItems = itemsData.map((i) => ({ ...i, order_id: order.id }));
    const { data: insertedItems, error: itemsError } = await supabase
      .from("order_items")
      .insert(finalItems)
      .select();

    if (itemsError) throw itemsError;

    // 3. Insert ledger entry (Only Shipping Cost as Profit)
    const { error: ledgerError } = await supabase.from("ledger_entries").insert({
      entry_type: "income",
      source: "order",
      category: "Ongkos Kirim",
      description: payload.note || null,
      amount: payload.shipping_cost,
      related_order_id: order.id,
    });

    if (ledgerError) throw ledgerError;

    return { order: order as Order, items: insertedItems as OrderItem[] };
  },

  getLedger: async (): Promise<LedgerEntry[]> => {
    const { data, error } = await supabase
      .from("ledger_entries")
      .select("*")
      .order("happened_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(30);
    if (error) throw error;
    return data as LedgerEntry[];
  },

  createLedgerEntry: async (payload: CreateLedgerInput): Promise<LedgerEntry> => {
    const { data, error } = await supabase
      .from("ledger_entries")
      .insert({
        ...payload,
        source: "manual",
        happened_at: payload.happened_at || new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data as LedgerEntry;
  },

  updateStore: async (id: number, input: { name: string; category: string; whatsapp_number?: string; maps_link?: string }): Promise<Store> => {
    const { data, error } = await supabase
      .from("stores")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Store;
  },

  updateOrder: async (id: number, payload: CreateOrderInput): Promise<OrderDetail> => {
    const productIds = payload.items.map((i) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError) throw productsError;
    if (!products || products.length === 0) throw new Error("Products not found");

    const productMap = new Map<number, Product>(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const itemsData = payload.items.map((item) => {
      const product = productMap.get(item.product_id);
      if (!product) throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`);

      const unit_price = item.unit_price ?? product.price;
      const line_total = unit_price * item.quantity;
      subtotal += line_total;

      return {
        order_id: id,
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price,
        line_total,
      };
    });

    const total_amount = subtotal + payload.shipping_cost;

    // 1. Update order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .update({
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone || null,
        shipping_cost: payload.shipping_cost,
        subtotal,
        total_amount,
        note: payload.note || null,
        shipping_address_link: payload.shipping_address_link || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Delete old items
    const { error: deleteItemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", id);
    if (deleteItemsError) throw deleteItemsError;

    // 3. Insert new items
    const { data: insertedItems, error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsData)
      .select();
    if (itemsError) throw itemsError;

    // 4. Update ledger entry for this order (Only Shipping Cost)
    const { error: ledgerError } = await supabase
      .from("ledger_entries")
      .update({ amount: payload.shipping_cost, description: payload.note || null })
      .eq("related_order_id", id);

    if (ledgerError) throw ledgerError;

    return { order: order as Order, items: insertedItems as OrderItem[] };
  },

  updateOrderStatus: async (id: number, status: "active" | "completed" | "cancelled"): Promise<Order> => {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    if (status === "cancelled") {
      // Remove the ledger entry so it doesn't count as income
      await supabase.from("ledger_entries").delete().eq("related_order_id", id);
    }

    return data as Order;
  },

  deleteOrder: async (id: number): Promise<void> => {
    // Delete ledger entry first to keep consistency since it has ON DELETE SET NULL
    await supabase.from("ledger_entries").delete().eq("related_order_id", id);
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
  },

  // ─── ORDER REQUESTS (Link Pelanggan) ───

  generateOrderRequest: async (): Promise<OrderRequest> => {
    const request_code = generateCode(8);

    // Generate order_number: DDMMYYXX
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const datePrefix = `${dd}${mm}${yy}`;

    // Count how many requests exist today
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const { count } = await supabase
      .from("order_requests")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfDay);
    const seq = String((count || 0) + 1).padStart(2, "0");
    const order_number = `${datePrefix}${seq}`;

    const { data, error } = await supabase
      .from("order_requests")
      .insert({ request_code, order_number })
      .select()
      .single();
    if (error) throw error;
    return data as OrderRequest;
  },

  createDirectOrderRequest: async (input: SubmitOrderRequestInput): Promise<OrderRequest> => {
    const request_code = generateCode(8);

    // Generate order_number: DDMMYYXX
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const datePrefix = `${dd}${mm}${yy}`;

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const { count } = await supabase
      .from("order_requests")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfDay);
    const seq = String((count || 0) + 1).padStart(2, "0");
    const order_number = `${datePrefix}${seq}`;

    const { data, error } = await supabase
      .from("order_requests")
      .insert({
        request_code,
        order_number,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        google_maps_link: input.google_maps_link || null,
        request_items: input.request_items,
        store_preferences: input.store_preferences || null,
        note: input.note || null,
        status: "pending",
        tracking_status: "pending",
        tracking_timestamps: { pending: now.toISOString() },
      })
      .select()
      .single();
      
    if (error) throw error;
    return data as OrderRequest;
  },


  getOrderRequests: async (): Promise<OrderRequest[]> => {
    const { data, error } = await supabase
      .from("order_requests")
      .select("*")
      .order("id", { ascending: false })
      .limit(30);
    if (error) throw error;
    return data as OrderRequest[];
  },

  getOrderRequestByCode: async (code: string): Promise<OrderRequest | null> => {
    const { data, error } = await supabase
      .from("order_requests")
      .select("*")
      .eq("request_code", code)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null; // not found
      throw error;
    }
    return data as OrderRequest;
  },

  submitOrderRequest: async (code: string, input: SubmitOrderRequestInput): Promise<OrderRequest> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("order_requests")
      .update({
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        google_maps_link: input.google_maps_link || null,
        request_items: input.request_items,
        store_preferences: input.store_preferences || null,
        note: input.note || null,
        status: "pending",
        tracking_status: "pending",
        tracking_timestamps: { pending: now },
      })
      .eq("request_code", code)
      .eq("status", "waiting")
      .select()
      .single();
    if (error) throw error;
    return data as OrderRequest;
  },

  updateTrackingStatus: async (id: number, tracking_status: TrackingStatus): Promise<OrderRequest> => {
    // First read current timestamps
    const { data: current } = await supabase
      .from("order_requests")
      .select("tracking_timestamps")
      .eq("id", id)
      .single();

    const existingTimestamps = (current?.tracking_timestamps as Record<string, string>) || {};
    const now = new Date().toISOString();
    const mergedTimestamps = { ...existingTimestamps, [tracking_status]: now };

    const updates: Record<string, unknown> = {
      tracking_status,
      tracking_timestamps: mergedTimestamps,
    };
    if (tracking_status === "completed") {
      updates.status = "completed";
    } else if (tracking_status !== "waiting" && tracking_status !== "pending") {
      updates.status = "processing";
    }
    const { data, error } = await supabase
      .from("order_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as OrderRequest;
  },

  linkRequestToOrder: async (requestId: number, orderId: number): Promise<void> => {
    const { error } = await supabase
      .from("order_requests")
      .update({ linked_order_id: orderId, status: "processing" })
      .eq("id", requestId);
    if (error) throw error;
  },

  createTrackingForOrder: async (orderId: number, customerName: string): Promise<OrderRequest> => {
    const request_code = generateCode(8);
    const { data, error } = await supabase
      .from("order_requests")
      .insert({
        request_code,
        customer_name: customerName,
        status: "processing",
        tracking_status: "pending",
        linked_order_id: orderId,
      })
      .select()
      .single();
    if (error) throw error;
    return data as OrderRequest;
  },

  deleteOrderRequest: async (id: number): Promise<void> => {
    const { error } = await supabase.from("order_requests").delete().eq("id", id);
    if (error) throw error;
  },
};
