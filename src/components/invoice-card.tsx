"use client";

import { forwardRef } from "react";

import { formatCurrency, formatDateTime } from "@/lib/format";
import type { OrderDetail } from "@/lib/types";

type InvoiceCardProps = {
  order: OrderDetail;
};

export const InvoiceCard = forwardRef<HTMLDivElement, InvoiceCardProps>(
  function InvoiceCard({ order }, ref) {
    // Generate a pseudo-random barcode pattern based on order ID
    const seed = order.order.id * 12345;
    const generateBarcode = () => {
      const bars = [];
      let currentSeed = seed;
      for (let i = 0; i < 40; i++) {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        const width = (currentSeed % 3) + 1;
        const space = (currentSeed % 2) + 1;
        bars.push(
          <div key={`bar-${i}`} className="bg-black h-10" style={{ width: `${width}px`, marginRight: `${space}px` }}></div>
        );
      }
      return bars;
    };

    return (
      <div
        ref={ref}
        className="w-full max-w-[340px] mx-auto bg-white p-6 shadow-md text-black font-mono text-sm leading-relaxed relative"
        style={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* Jagged top border effect */}
        <div className="absolute top-0 left-0 w-full h-2" style={{
          backgroundImage: "linear-gradient(135deg, transparent 50%, white 50%), linear-gradient(225deg, white 50%, transparent 50%)",
          backgroundSize: "8px 8px",
          backgroundRepeat: "repeat-x",
          top: "-8px",
          filter: "drop-shadow(0 -2px 1px rgba(0,0,0,0.02))"
        }}></div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider">JSTIPKU</h1>
          <p className="text-xs mt-1 text-gray-600">Jasa Titip Terpercaya</p>
          <p className="text-xs mt-1">{formatDateTime(order.order.created_at)}</p>
          <div className="text-xs mt-3 border-y border-dashed border-gray-400 py-2 font-semibold">
            <p>ORDER #{order.order.id}</p>
            <p className="truncate">CUST: {order.order.customer_name}</p>
          </div>
        </div>

        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b border-dashed border-gray-400">
              <th className="text-left font-normal pb-1 w-8">QTY</th>
              <th className="text-left font-normal pb-1">ITEM</th>
              <th className="text-right font-normal pb-1">TOTAL</th>
            </tr>
          </thead>
          <tbody className="before:block before:h-2">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="align-top py-1">{item.quantity}</td>
                <td className="align-top py-1 pr-2">{item.product_name}</td>
                <td className="align-top text-right py-1">{formatCurrency(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-gray-400 pt-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span>{formatCurrency(order.order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>ONGKIR</span>
            <span>{formatCurrency(order.order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-dashed border-gray-400">
            <span>TOTAL</span>
            <span>{formatCurrency(order.order.total_amount)}</span>
          </div>
        </div>

        {order.order.shipping_address_link && (
          <div className="mt-4 border border-dashed border-gray-400 p-2 text-[10px] text-center">
            <p className="font-bold mb-1">📍 ALAMAT PENGIRIMAN</p>
            <a 
              href={order.order.shipping_address_link}
              target="_blank"
              rel="noreferrer"
              className="break-all text-blue-600 underline"
            >
              {order.order.shipping_address_link}
            </a>
          </div>
        )}

        <div className="mt-6 text-center text-xs">
          {order.order.note && (
            <div className="mb-4 text-left border border-dashed border-gray-400 p-2 bg-gray-50">
              <p className="font-bold mb-1">CATATAN:</p>
              <p className="whitespace-pre-wrap">{order.order.note}</p>
            </div>
          )}
          <p className="font-bold">TERIMA KASIH!</p>
          <p className="mt-1">Silakan order kembali</p>
          
          {/* Barcode graphic */}
          <div className="flex justify-center mt-5 mb-2 overflow-hidden">
            {generateBarcode()}
          </div>
          <p className="text-[10px] tracking-widest">{seed}100234{order.order.id}</p>
        </div>

        {/* Jagged bottom border effect */}
        <div className="absolute bottom-0 left-0 w-full h-2" style={{
          backgroundImage: "linear-gradient(135deg, white 50%, transparent 50%), linear-gradient(225deg, transparent 50%, white 50%)",
          backgroundSize: "8px 8px",
          backgroundRepeat: "repeat-x",
          bottom: "-8px",
          filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.02))"
        }}></div>
      </div>
    );
  },
);
