import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Order, OrderItem } from "@/types";
import { QRCodeCanvas } from "qrcode.react";
import React from "react";

interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
}

interface ReceiptTemplateProps {
  order: Order;
  orderItems: OrderItem[];
  businessInfo: BusinessInfo;
}

// Template 1: Cash/Transfer/QRIS Payment
export const CashTransferReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  ReceiptTemplateProps
>(({ order, orderItems, businessInfo }, ref) => {
  return (
    <div ref={ref} className="w-[260px] p-2 bg-white text-[8px] leading-[1.1] ">
      <div className="">
        {/* Header */}
        <div className="text-left mb-1">
          <div className="text-[6px] font-semibold ">
            Bayar Pakai Cash, Transfer, QRIS
          </div>
        </div>

        <div className="py-1">
          <div className="flex items-start gap-1">
            <div className="flex-1 space-y-0.5">
              <div className="font-semibold text-[8px]">
                {businessInfo.name || ""}
              </div>
              <div className="text-[7px]">{businessInfo.address || ""}</div>
              <div className="text-[7px]">{businessInfo.phone || ""}</div>
            </div>
            <div className="w-8 h-8">
              <img src="/pdf-logo.png" alt="Pdf logo" />
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="py-1 flex flex-col space-y-0.5 items-center text-center">
          <div className="text-center font-semibold text-[7px]">
            Nota Customer
          </div>
          <div className="text-center font-semibold text-[10px]">
            {order.customer?.name}
          </div>
          <div className="text-center font-semibold text-[7px]">
            Nota : {order.order_number}
          </div>
        </div>

        {/* Transaction Info */}
        <div className="py-1 text-[7px] space-y-1">
          <div className="flex justify-start gap-2">
            <span className="w-28">Transaksi</span>
            <span>OFFLINE</span>
          </div>
          <div className="flex justify-start gap-2">
            <span className="w-28">Kasir</span>
            <span>Sri</span>
          </div>
        </div>

        {/* Items */}
        <div className="py-1 text-[8px]">
          <div className="font-bold mb-1">TRANSAKSI</div>

          <table className="w-full text-left">
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.service?.name}</td>
                  <td colSpan={3}></td>
                  <td className="text-right">{item.service?.min_weight} kg</td>
                  <td className="text-center">x</td>
                  <td className="text-right">{item.service?.price_per_kg}</td>
                  <td className="text-right">
                    {item.service?.price ||
                      Number(item.service?.min_weight) *
                        Number(item.service?.price_per_kg)}
                  </td>
                </tr>
              ))}
              <tr className="h-1" />
              <tr>
                <td>Total Harga</td>
                <td colSpan={6}></td>
                <td className="text-right">{order.total_amount}</td>
              </tr>
              <tr>
                <td>Diskon</td>
                <td colSpan={6}></td>
                <td className="text-right">-</td>
              </tr>
              <tr className="h-2" />
              <tr className="font-normal">
                <td colSpan={4}></td>
                <td className="text-right">Harus dibayar</td>
                <td colSpan={2}></td>
                <td className="text-right font-semibold">
                  {order.total_amount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Date and Status */}
        <div className="py-2 text-[7px] space-y-1">
          <div className="flex justify-start ">
            <span className="w-28">Tanggal Masuk</span>
            <span className="font-bold ms-2">
              {formatDateTime(order.created_at)}
            </span>
          </div>
          <div className="flex justify-start">
            <span className="w-28">Estimasi Selesai</span>
            <span className="font-bold ms-2">
              {formatDateTime(order.estimated_completion)}
            </span>
          </div>
          <div className="flex justify-start font-bold">
            <span className="w-28">Pembayaran</span>
            <span className="uppercase ms-2">{order.payment_method}</span>
          </div>
          <div className="flex justify-start font-bold">
            <span className="w-28">Status</span>
            <span className="uppercase ms-2">{order.payment_status}</span>
          </div>
        </div>

        <div className="text-left text-[7px] mb-2 mt-5">Catatan</div>
        <div className="flex flex-col gap-1">
          <div className="w-full h-[0.5px] bg-black"></div>
          <p className="text-[7px] italic text-center">free tex</p>
          <div className="w-full h-[0.5px] bg-black"></div>
        </div>

        {/* Terms Section */}
        <div className="mt-3 text-[6px] leading-[1.1]">
          <div className="mb-1">Ketentuan Penting:</div>
          <ol className="list-decimal ml-4 space-y-1">
            <li>
              Kusut, susut, luntur karena kondisi bahan bukan tanggung jawab
              laundry
            </li>
            <li>Komplain maksimal 3 hari dan wajib video unboxing</li>
          </ol>
        </div>

        {/* Customer Service */}
        <div className="mt-5 text-[6px] leading-[1.1] mb-3">
          <div className="font-bold">
            Customer Service :
            <span className="text-black font-bold">0811-9876-771</span>
          </div>
          <div className="font-bold text-[6.5px]">#laundryapasajabisa</div>
        </div>
      </div>
    </div>
  );
});

// Template 2: Deposit Payment
export const DepositReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  ReceiptTemplateProps
>(({ order, orderItems, businessInfo }, ref) => {
  return (
    <div ref={ref} className="w-[260px] p-2 bg-white text-[8px] leading-[1.1] ">
      <div className="">
        {/* Header */}
        <div className="text-left mb-1">
          <div className="text-[6px] font-semibold">Bayar Pakai Deposit </div>
        </div>

        <div className="py-1">
          <div className="flex items-start gap-1">
            <div className="flex-1 space-y-0.5">
              <div className="font-semibold text-[8px]">
                {businessInfo.name || ""}
              </div>
              <div className="text-[7px]">{businessInfo.address || ""}</div>
              <div className="text-[7px]">{businessInfo.phone || ""}</div>
            </div>
            <div className="w-8 h-8">
              <img src="/pdf-logo.png" alt="Pdf logo" />
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="py-1 flex flex-col space-y-0.5 items-center text-center">
          <div className="text-center font-semibold text-[7px]">
            Nota Customer
          </div>
          <div className="text-center font-semibold text-[10px]">
            {order.customer?.name}
          </div>
          <div className="text-center font-semibold text-[7px]">
            Nota : {order.order_number}
          </div>
        </div>

        {/* Transaction Info */}
        <div className="py-1 text-[7px] space-y-1">
          <div className="flex justify-start gap-2">
            <span className="w-28">Transaksi</span>
            <span>OFFLINE</span>
          </div>
          <div className="flex justify-start gap-2">
            <span className="w-28">Kasir</span>
            <span>Sri</span>
          </div>
        </div>

        {/* Items */}
        <div className="py-1 text-[8px]">
          <div className="font-bold mb-1">TRANSAKSI</div>

          <table className="w-full text-left">
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.service?.name}</td>
                  <td colSpan={3}></td>
                  <td className="text-right">{item.service?.min_weight} kg</td>
                  <td className="text-center">x</td>
                  <td className="text-right">{item.service?.price_per_kg}</td>
                  <td className="text-right">
                    {item.service?.price ||
                      Number(item.service?.min_weight) *
                        Number(item.service?.price_per_kg)}
                  </td>
                </tr>
              ))}
              <tr className="h-1" />
              <tr>
                <td>Total Harga</td>
                <td colSpan={6}></td>
                <td className="text-right">{order.total_amount}</td>
              </tr>
              <tr>
                <td>Diskon</td>
                <td colSpan={6}></td>
                <td className="text-right">-</td>
              </tr>
              <tr className="h-2" />
              <tr className="font-normal">
                <td colSpan={4}></td>
                <td className="text-right">Harus dibayar</td>
                <td colSpan={2}></td>
                <td className="text-right font-semibold">
                  {order.total_amount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Date and Status */}
        <div className="py-2 text-[7px] space-y-1">
          <div className="flex justify-start ">
            <span className="w-28">Tanggal Masuk</span>
            <span className="font-bold ms-2">
              {formatDateTime(order.created_at)}
            </span>
          </div>
          <div className="flex justify-start">
            <span className="w-28">Estimasi Selesai</span>
            <span className="font-bold ms-2">
              {formatDateTime(order.estimated_completion)}
            </span>
          </div>
          <div className="flex justify-start font-bold">
            <span className="w-28">Pembayaran</span>
            <span className="uppercase ms-2">{order.payment_method}</span>
          </div>
          <div className="flex justify-start font-bold">
            <span className="w-28">Status</span>
            <span className="uppercase ms-2">{order.payment_status}</span>
          </div>
          <div className="flex justify-start font-bold">
            <span className="w-28">Nilai Potong Deposit</span>
            <span className="uppercase ms-2">-</span>
          </div>
          <div className="flex justify-start font-bold">
            <span className="w-28">Saldo Deposit</span>
            <span className="uppercase ms-2">-</span>
          </div>
        </div>

        <div className="text-left text-[7px] mb-2 mt-5">Catatan</div>
        <div className="flex flex-col gap-1">
          <div className="w-full h-[0.5px] bg-black"></div>
          <p className="text-[7px] italic text-center">free tex</p>
          <div className="w-full h-[0.5px] bg-black"></div>
        </div>

        {/* Terms Section */}
        <div className="mt-3 text-[6px] leading-[1.1]">
          <div className="mb-1">Ketentuan Penting:</div>
          <ol className="list-decimal ml-4 space-y-1">
            <li>
              Kusut, susut, luntur karena kondisi bahan bukan tanggung jawab
              laundry
            </li>
            <li>Komplain maksimal 3 hari dan wajib video unboxing</li>
          </ol>
        </div>

        {/* Customer Service */}
        <div className="mt-5 text-[6px] leading-[1.1] mb-3">
          <div className="font-bold">
            Customer Service :
            <span className="text-black font-bold">0811-9876-771</span>
          </div>
          <div className="font-bold text-[6.5px]">#laundryapasajabisa</div>
        </div>
      </div>
    </div>
  );
});

// Template 3: Internal Print
export const InternalReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  ReceiptTemplateProps
>(({ order, orderItems, businessInfo }, ref) => {
  return (
    <div ref={ref} className="w-[230px] p-2 bg-white text-[8px] leading-[1.1] ">
      <div className="">
        {/* Header */}
        <div className="text-left mb-1">
          <div className="text-[6px] font-semibold">Bayar Pakai Deposit </div>
        </div>

        <div className="py-1">
          <div className="flex items-start gap-1">
            <div className="flex-1 space-y-0.5">
              <div className="font-semibold text-[8px]">
                {businessInfo.name || ""}
              </div>
              <div className="text-[7px]">{businessInfo.address || ""}</div>
              <div className="text-[7px]">{businessInfo.phone || ""}</div>
            </div>
            <div className="w-8 h-8">
              <img src="/pdf-logo.png" alt="Pdf logo" />
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="py-1 flex flex-col space-y-0.5 items-center text-center">
          <div className="text-center font-semibold text-[7px]">
            Nota Customer
          </div>
          <div className="text-center font-semibold text-[10px]">
            {order.customer?.name}
          </div>
          <div className="text-center font-semibold text-[7px]">
            Nota : {order.order_number}
          </div>
        </div>

        {/* Items */}
        <div className="py-1 text-[8px]">
          <div className="font-bold mb-1 opacity-0">TRANSAKSI</div>
          <table className="w-full text-left">
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.service?.name}</td>
                  <td className="text-left font-bold">
                    {item.service?.min_weight} kg
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Date and Status */}
        <div className="pb-2 text-[8px] space-y-1">
          <div className="flex justify-start ">
            <span className="w-28">Tanggal Masuk</span>
            <span className="font-bold ms-2">
              {formatDateTime(order.created_at)}
            </span>
          </div>
          <div className="flex justify-start">
            <span className="w-28">Estimasi Selesai</span>
            <span className="font-bold ms-2">
              {formatDateTime(order.estimated_completion)}
            </span>
          </div>
          <div className="flex justify-start font-bold">
            <span className="w-28">Status</span>
            <span className="uppercase ms-2">{order.payment_status}</span>
          </div>
        </div>

        <div className="text-left text-[7px] mb-2 mt-3">Catatan</div>
        <div className="flex flex-col gap-1">
          <div className="w-full h-[0.5px] bg-black"></div>
          <p className="text-[7px] italic text-center">free tex</p>
          <div className="w-full h-[0.5px] bg-black"></div>
        </div>
      </div>
    </div>
  );
});

// Template 4:
export const ReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  ReceiptTemplateProps
>(({ order, orderItems, businessInfo }, ref) => {
  const totalPaid = order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const change =
    totalPaid > order.total_amount ? totalPaid - order.total_amount : 0;
  const paymentMethod = order.payment_method || "N/A";

  // QR Code data string (could be plain or a URL)
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
      {/* Header */}
      <div className="text-center mb-4">
        <img src="/pdf-logo.png" className="w-20 h-auto mx-auto" />
        <h1 className="text-lg font-bold mt-[-10pxs]">{businessInfo.name}</h1>
        <p>{businessInfo.address}</p>
        <p>{businessInfo.phone}</p>
      </div>

      {/* Order Info */}
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

      {/* Customer Info */}
      <div className="mb-4">
        <p className="font-bold">Untuk Customer:</p>
        <p>{order.customer?.name || "N/A"}</p>
        <p>Total Lunas: {formatCurrency(order.total_amount)}</p>
      </div>

      {/* Items */}
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

      {/* Summary */}
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
          <span>Pembayaran: </span>
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

      {/* Terms */}
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

      {/* QR Code */}
      <div className="flex flex-col items-center">
        <QRCodeCanvas value={qrData} size={128} level="H" />
        <div className="text-[8px] text-center max-w-[280px] break-words mt-2">
          <p className="font-bold">QR Data:</p>
          <p>{qrData}</p>
        </div>
      </div>
    </div>
  );
});

CashTransferReceiptTemplate.displayName = "CashTransferReceiptTemplate";
DepositReceiptTemplate.displayName = "DepositReceiptTemplate";
InternalReceiptTemplate.displayName = "InternalReceiptTemplate";
ReceiptTemplate.displayName = "ReceiptTemplate";
