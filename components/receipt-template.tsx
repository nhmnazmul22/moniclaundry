import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Order, OrderItem } from "@/types";
import { Dot } from "lucide-react";
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

// Template 1: Cash/Transfer/QRIS/Deposit Payment
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
            Bayar Pakai{" "}
            {order.payment_method &&
              order.payment_method[0].toUpperCase() +
                order.payment_method?.slice(1)}
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
            {order.customerDetails?.name}
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
                <tr key={item._id}>
                  <td>{item.serviceDetails?.servicename! || "N/A"}</td>
                  <td colSpan={3}></td>
                  <td className="text-right">
                    {item.quantity}
                    {item.serviceDetails.type === "Satuan" ? "pcs" : "kg"}
                  </td>
                  <td className="text-center">x</td>
                  <td className="text-right">
                    {formatCurrency(item.serviceDetails?.price)}
                  </td>
                  <td className="text-right">
                    {formatCurrency(
                      item.quantity * item?.serviceDetails?.price!
                    )}
                  </td>
                </tr>
              ))}
              <tr className="h-1" />
              <tr>
                <td>Total Harga</td>
                <td colSpan={6}></td>
                <td className="text-right">
                  {formatCurrency(order.total_amount)}
                </td>
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
                  {formatCurrency(order.total_amount - order.discount)}
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
              {formatDateTime(order.createdAt)}
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
          {order.payment_method === "deposit" && (
            <>
              <div className="flex justify-start font-bold">
                <span className="w-28">Nilai Potong Deposit</span>
                <span className="uppercase ms-2">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
              <div className="flex justify-start font-bold">
                <span className="w-28">Saldo Deposit</span>
                <span className="uppercase ms-2">
                  {formatCurrency(order.customerDetails?.deposit_balance)}
                </span>
              </div>
            </>
          )}
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

// Template 2: Internal Print
export const InternalReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  ReceiptTemplateProps
>(({ order, orderItems, businessInfo }, ref) => {
  return (
    <div ref={ref} className="w-[230px] p-2 bg-white text-[8px] leading-[1.1] ">
      <div className="">
        {/* Header */}
        <div className="text-left mb-1">
          <div className="text-[6px] font-semibold">
            Bayar Pakai{" "}
            {order.payment_method &&
              order.payment_method[0].toUpperCase() +
                order.payment_method?.slice(1)}
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
            {order.customerDetails?.name}
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
                <tr key={item._id}>
                  <td>{item.serviceDetails?.servicename}</td>
                  <td className="text-left font-bold">
                    {item.quantity}
                    {item.serviceDetails.type === "Satuan" ? "pcs" : "kg"}
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
              {formatDateTime(order.createdAt)}
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

// Template 3:
export const ReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  ReceiptTemplateProps
>(({ order, orderItems, businessInfo }, ref) => {
  // const totalPaid = order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalPaid = order.total_amount;
  const change =
    totalPaid > order.total_amount ? totalPaid - order.total_amount : 0;
  const paymentMethod = order.payment_method || "N/A";

  // QR Code data string (could be plain or a URL)
  const qrData = `Order: ${order.order_number} | Customer: ${
    order.customerDetails?.name || "N/A"
  } | Date: ${new Date(order.createdAt!).toLocaleDateString(
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
          <span>{formatDateTime(order.createdAt)}</span>
        </div>
        {order.estimated_completion && (
          <div className="flex justify-between">
            <span>Est.Ambil</span>
            <span>{formatDateTime(order.estimated_completion)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Status</span>
          <span>
            {order.order_status[0].toUpperCase() + order.order_status.slice(1)}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4 flex flex-col gap-1">
        <span className="font-bold">Untuk Customer:</span>
        <span>{order.customerDetails?.name || "N/A"}</span>
        <span>Total Lunas: {formatCurrency(order.total_amount)}</span>
      </div>

      {/* Items */}
      <div className="border-t border-b border-dashed py-2 mb-2">
        {orderItems.map((item) => (
          <div key={item._id} className="mb-2 flex flex-col gap-1">
            <span className="font-bold block">
              {item?.serviceDetails?.servicename || "N/A"}
            </span>
            <span className="block">
              {item.quantity}
              {item.serviceDetails.type === "Satuan" ? "pcs" : "kg"} x{" "}
              {formatCurrency(item.unit_price)}
            </span>
            <span className="text-right block">
              Subtotal: {formatCurrency(item.subtotal)}
            </span>
            {item.notes && (
              <span className="text-xs italic block">
                Catatan: {item.notes}
              </span>
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
      <div className="border-t border-b border-dashed py-2 mb-4 text-left">
        <p>
          Dengan mencuci di {businessInfo.name}, maka Customer telah setuju
          dengan ketentuan yang berlaku:
        </p>
        <div className="text-left flex flex-col gap-1">
          <p className="flex gap-1 items-start p-0 m-0">
            <span>
              <Dot />
            </span>
            Pakaian luntur, mudah susut & kerut karena kondisi bahan di luar
            tanggung jawab kami
          </p>
          <p className="flex gap-1 items-start p-0 m-0">
            <span>
              <Dot />
            </span>
            Komplain dgn nota asli & max 3x24 jam
          </p>
          <p className="flex gap-1 items-start p-0 m-0">
            <span>
              <Dot />
            </span>
            Ganti rugi: Total biaya/jumlah cucian x 10
          </p>
          <p className="flex gap-1 items-start p-0 m-0">
            <span>
              <Dot />
            </span>
            Ganti rugi cuci satuan sesuai harga barang & maksimal: harga biaya
            cuci x 10
          </p>
          <p className="flex gap-1 items- p-0 m-0">
            <span>
              <Dot />
            </span>
            Kami tidak bertanggung jawab utk cucian yg tdk diambil dlm waktu 14
            hari
          </p>
        </div>
        <p className="mt-4 text-center">CS : {businessInfo.phone}</p>
        <p className="text-center">==========Terima Kasih==========</p>
        <p className="mt-2 text-center">Powered By Monic Laundry POS</p>
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
InternalReceiptTemplate.displayName = "InternalReceiptTemplate";
ReceiptTemplate.displayName = "ReceiptTemplate";
