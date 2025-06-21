import { formatDateTime } from "@/lib/utils";
import type { Order, OrderItem } from "@/types/database";
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
  console.log(order);
  console.log(orderItems);
  console.log(businessInfo);

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
        <div
          className="border-t border-b border-black text-[7px] italic text-center py-[3px] leading-none"
          style={{ minHeight: "16px" }}
        >
          free tex
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
        <div
          className="border-t border-b border-black text-[7px] italic text-center py-[3px] leading-none"
          style={{ minHeight: "16px" }}
        >
          free tex
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
    <div
      ref={ref}
      className="w-[280px] p-2 bg-white font-mono text-[8px] leading-[1.1] border-2 border-black"
    >
      {/* Header */}
      <div className="text-center mb-1">
        <div className="text-[9px] font-bold">
          INTERNAL PRINT untuk KEBUTUHAN LAUNDRY
        </div>
      </div>

      <div className="border-t border-b border-black py-1 mb-1">
        <div className="flex items-start gap-1">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[6px] font-bold mt-0.5">
            🏪
          </div>
          <div className="flex-1">
            <div className="font-bold text-[9px]">MONIC Laundry Galaxy</div>
            <div className="text-[7px]">
              Jl. Taman Galaxy Raya No 301 E Jakarta Bekasi Selatan
            </div>
            <div className="text-[7px]">0877-1010-9075</div>
          </div>
        </div>
      </div>

      {/* Customer Section */}
      <div className="mb-1">
        <div className="text-center font-bold text-[8px] mb-0.5">
          Nota untuk Internal
        </div>
        <div className="text-center font-bold text-[9px]">NAMA CUSTOMER</div>
        <div className="text-center text-[8px]">Nota : 123456</div>
      </div>

      {/* Service Details */}
      <div className="mb-1 text-[7px] space-y-0.5">
        <div className="flex justify-between">
          <span>Cuci Kering Setrika</span>
          <span>3.5 kg</span>
        </div>
        <div className="flex justify-between">
          <span>Setrika</span>
          <span>1 kg</span>
        </div>
        <div className="flex justify-between">
          <span>Tanggal Masuk</span>
          <span>20 Juni 2025 - 15.30</span>
        </div>
        <div className="flex justify-between">
          <span>Estimasi Selesai</span>
          <span>21 Juni 2025 - 15.30</span>
        </div>
        <div className="flex justify-between">
          <span>Status</span>
          <span>LUNAS</span>
        </div>
      </div>

      {/* Notes Section */}
      <div className="border-t border-black pt-1">
        <div className="font-bold text-[8px] mb-1">Catatan</div>
        <div className="border border-gray-400 h-16 p-1 bg-white">
          <div className="text-center italic text-[7px] mt-4">free ice</div>
        </div>
      </div>
    </div>
  );
});

CashTransferReceiptTemplate.displayName = "CashTransferReceiptTemplate";
DepositReceiptTemplate.displayName = "DepositReceiptTemplate";
InternalReceiptTemplate.displayName = "InternalReceiptTemplate";
