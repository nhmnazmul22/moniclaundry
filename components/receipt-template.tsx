"use client";

import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Order, OrderItem } from "@/types/database";
import React from "react";

interface ReceiptTemplateProps {
  order: Order;
  orderItems: OrderItem[];
  businessInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

export const ReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  ReceiptTemplateProps
>(({ order, orderItems, businessInfo }, ref) => {
  const totalPaid = order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const change =
    totalPaid > order.total_amount ? totalPaid - order.total_amount : 0;
  const paymentMethod = order.payment_method || "N/A";

  // QR Code data
  const qrData = `Order: ${order.order_number} | Customer: ${
    order.customer?.name || "N/A"
  } | Date: ${new Date(order.created_at).toLocaleDateString(
    "id-ID"
  )} | Status: ${order.order_status}`;

  return (
    <div
      ref={ref}
      className="p-4 bg-white text-black text-xs font-mono w-[300px] mx-auto"
    >
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">{businessInfo.name}</h1>
        <p>{businessInfo.address}</p>
        <p>{businessInfo.phone}</p>
      </div>

      <div className="border-t border-b border-dashed py-2 mb-2">
        <div className="flex justify-between">
          <span>Kode struk</span>
          <span>{order.order_number}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir</span>
          <span>Admin</span>
        </div>
        <div className="flex justify-between">
          <span>Terima</span>
          <span>{formatDateTime(order.created_at)}</span>
        </div>
        {order.estimated_completion && (
          <div className="flex justify-between">
            <span>Est.Ambil</span>
            <span>{formatDateTime(order.estimated_completion)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Selesai</span>
          <span>
            {order.delivery_date
              ? formatDateTime(order.delivery_date)
              : "Belum selesai"}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-bold">Untuk Customer:</p>
        <p>{order.customer?.name || "N/A"}</p>
        <p>Total Lunas: {formatCurrency(order.total_amount)}</p>
      </div>

      <div className="border-t border-b border-dashed py-2 mb-2">
        {orderItems.map((item) => (
          <div key={item.id} className="mb-2">
            <p className="font-bold">{item.service?.name || "N/A"}</p>
            <p>
              {item.quantity} {item.service?.min_weight || "kg"} x{" "}
              {formatCurrency(item.unit_price)}
            </p>
            <p className="text-right">
              Subtotal: {formatCurrency(item.subtotal)}
            </p>
            {item.notes && (
              <p className="text-xs italic">Catatan: {item.notes}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex justify-between">
          <span>Total:</span>
          <span className="font-bold">{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <span>Diskon:</span>
            <span>{formatCurrency(order.discount)}</span>
          </div>
        )}
        {order.tax > 0 && (
          <div className="flex justify-between">
            <span>Pajak:</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base mt-1">
          <span>Grand Total:</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Pembayaran:</span>
          <span>{paymentMethod.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Status Bayar:</span>
          <span>{order.payment_status?.toUpperCase()}</span>
        </div>
        {totalPaid > 0 && (
          <div className="flex justify-between">
            <span>Jumlah Bayar:</span>
            <span>{formatCurrency(totalPaid)}</span>
          </div>
        )}
        {change > 0 && (
          <div className="flex justify-between">
            <span>Kembali:</span>
            <span>{formatCurrency(change)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-b border-dashed py-2 mb-4 text-center">
        <p>
          Dengan mencuci di {businessInfo.name}, maka Customer telah setuju
          dengan ketentuan yang berlaku:
        </p>
        <ul className="list-disc list-inside text-left mt-2">
          <li>
            Pakaian luntur, mudah susut & kerut karena kondisi bahan di luar
            tanggung jawab kami
          </li>
          <li>Komplain dgn nota asli & max 3x24 jam</li>
          <li>Ganti rugi: Total biaya/jumlah cucian x 10</li>
          <li>
            Ganti rugi cuci satuan sesuai harga barang & maksimal: harga biaya
            cuci x 10
          </li>
          <li>
            Kami tidak bertanggung jawab utk cucian yg tdk diambil dlm waktu 14
            hari
          </li>
        </ul>
        <p className="mt-4">CS : {businessInfo.phone}</p>
        <p>==========Terima Kasih==========</p>
        <p className="mt-2">Powered By Monic Laundry POS</p>
      </div>

      {/* QR Code Placeholder - Data yang akan di-encode ke QR */}
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 border-2 border-dashed border-gray-400 flex items-center justify-center mb-2">
          <div className="text-center text-xs">
            <p>QR CODE</p>
            <p className="text-[8px] mt-1">Scan untuk info order</p>
          </div>
        </div>
        <div className="text-[8px] text-center max-w-[280px] break-words">
          <p className="font-bold">QR Data:</p>
          <p>{qrData}</p>
        </div>
      </div>
    </div>
  );
});

ReceiptTemplate.displayName = "ReceiptTemplate";

export default ReceiptTemplate;
