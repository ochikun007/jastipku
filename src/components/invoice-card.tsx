"use client";

import { forwardRef } from "react";

import { formatCurrency, formatDateTime } from "@/lib/format";
import type { OrderDetail } from "@/lib/types";

type InvoiceCardProps = {
  order: OrderDetail;
};

export const InvoiceCard = forwardRef<HTMLDivElement, InvoiceCardProps>(
  function InvoiceCard({ order }, ref) {
    return (
      <div
        ref={ref}
        className="w-full max-w-[420px] overflow-hidden rounded-[32px] bg-[#fffaf4] text-[#20160f] shadow-[0_24px_80px_rgba(100,49,16,0.18)]"
      >
        <div className="bg-[linear-gradient(135deg,#ffb347_0%,#ff8c61_48%,#f35b4b_100%)] px-6 pb-6 pt-7 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/75">
                Nota Pembelian
              </p>
              <h3 className="mt-2 font-[family:var(--font-display)] text-3xl font-semibold leading-none">
                TitipGo
              </h3>
            </div>
            <div className="rounded-full border border-white/35 px-3 py-1 text-xs font-semibold text-white/90">
              #{order.order.id}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/70">Pelanggan</p>
              <p className="mt-1 font-semibold">{order.order.customer_name}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70">Waktu</p>
              <p className="mt-1 font-semibold">
                {formatDateTime(order.order.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-[0_12px_30px_rgba(116,77,47,0.08)]"
              >
                <div>
                  <p className="font-semibold">{item.product_name}</p>
                  <p className="mt-1 text-sm text-[#7a6357]">
                    {item.quantity} x {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(item.line_total)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[28px] border border-[#f2dfcf] bg-white px-4 py-4">
            <div className="flex items-center justify-between text-sm text-[#6d5549]">
              <span>Subtotal</span>
              <span>{formatCurrency(order.order.subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-[#6d5549]">
              <span>Ongkir</span>
              <span>{formatCurrency(order.order.shipping_cost)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#f0d3bd] pt-4">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b4a2d]">
                Total
              </span>
              <span className="font-[family:var(--font-display)] text-3xl font-semibold text-[#2a1b11]">
                {formatCurrency(order.order.total_amount)}
              </span>
            </div>
          </div>

          {order.order.shipping_address_link && (
            <div className="rounded-[24px] bg-[#eef5fa] px-4 py-4 text-sm text-[#183952] mb-5">
              <p className="text-[#3b678a] font-semibold">Alamat Pengiriman</p>
              <a
                href={order.order.shipping_address_link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[#1e6194] underline underline-offset-4 transition hover:text-[#114066]"
              >
                Buka di Google Maps
              </a>
            </div>
          )}

          <div className="rounded-[24px] bg-[#2b1d14] px-4 py-4 text-sm text-white">
            <p className="text-white/70">Catatan</p>
            <p className="mt-2 leading-6 text-white/90">
              {order.order.note?.trim() || "Terima kasih telah menggunakan jasa titip kami."}
            </p>
          </div>
        </div>
      </div>
    );
  },
);
