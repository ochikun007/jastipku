export type Store = {
  id: number;
  name: string;
  category: string;
  whatsapp_number: string | null;
  maps_link: string | null;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  note: string | null;
  image_url: string | null;
  store_id: number | null;
  stores?: { name: string } | null;
  created_at: string;
};

export type Order = {
  id: number;
  customer_name: string;
  shipping_cost: number;
  subtotal: number;
  total_amount: number;
  note: string | null;
  shipping_address_link: string | null;
  status: "active" | "completed" | "cancelled";
  order_items?: OrderItem[];
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type OrderDetail = {
  order: Order;
  items: OrderItem[];
};

export type LedgerEntry = {
  id: number;
  entry_type: "income" | "expense";
  source: "manual" | "order" | string;
  category: string;
  description: string | null;
  amount: number;
  related_order_id: number | null;
  happened_at: string;
  created_at: string;
};

export type Summary = {
  total_income: number;
  total_expense: number;
  balance: number;
  total_orders: number;
  product_count: number;
};

export type CreateProductInput = {
  name: string;
  category: string;
  price: number;
  note?: string;
  image_url?: string | null;
  store_id?: number | null;
};

export type CreateOrderInput = {
  customer_name: string;
  shipping_cost: number;
  note?: string;
  shipping_address_link?: string | null;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price?: number;
  }>;
};

export type CreateLedgerInput = {
  entry_type: "income" | "expense";
  category: string;
  description?: string;
  amount: number;
  happened_at?: string;
};
