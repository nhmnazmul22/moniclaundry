"use client";
import { useBranch } from "@/contexts/branch-context";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import { fetchDepositTypes } from "@/store/depositTypesSlice";
import type {
  BusinessSetting,
  Customer,
  DepositType,
  Order,
  OrderItem,
} from "@/types";
import { Dot } from "lucide-react";
import { useSession } from "next-auth/react";
import { QRCodeCanvas } from "qrcode.react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  type: string;
}

interface ReceiptTemplateProps {
  order?: Order;
  orderItems?: OrderItem[];
  businessInfo: BusinessInfo;
  customer?: Customer;
  receiptInfo?: BusinessSetting;
}

// Template 1: Cash/Transfer/QRIS/Deposit Payment
export const CashTransferReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  ReceiptTemplateProps
>(({ order, orderItems, businessInfo }, ref) => {
  const { data: session } = useSession();

  return (
    <div ref={ref} className="w-[260px] p-2 bg-white text-[8px] leading-[1.1] ">
      <div className="">
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
            {order?.customerDetails?.name}
          </div>
          <div className="text-center font-semibold text-[7px]">
            Nota : {order?.order_number}
          </div>
        </div>

        {/* Transaction Info */}
        <div className="py-1 text-[7px] space-y-1">
          <div className="flex justify-start gap-2">
            <span className="w-[70px]">Transaksi</span>
            <span className="uppercase">{businessInfo.type}</span>
          </div>
          <div className="flex justify-start gap-2">
            <span className="w-[70px]">Kasir</span>
            <span>{session?.user.name}</span>
          </div>
        </div>

        {/* Items */}
        <div className="py-1 text-[8px]">
          <div className="font-bold mb-1">TRANSAKSI</div>

          <table className="w-full text-left">
            <tbody className="flex flex-col gap-1">
              {orderItems &&
                orderItems.map((item) => (
                  <tr key={item._id}>
                    <td width={"78px"}>
                      {item.serviceDetails?.servicename! || "N/A"}
                    </td>
                    <td className="text-left w-[30px]">
                      {item.quantity}
                      {item.serviceDetails.type === "Satuan" ? " pcs" : " kg"}
                    </td>
                    <td className="text-center w-[20px]">x</td>
                    {item.serviceDetails.price && (
                      <td className="text-right w-[40px]">
                        {formatCurrency(item.serviceDetails.price)
                          .replace("Rp", "")
                          .replace(".", ",")}
                      </td>
                    )}
                    {item.serviceDetails && item.quantity && (
                      <td className="text-right w-[40px]">
                        {formatCurrency(
                          item.quantity * item.serviceDetails.price
                        )
                          .replace("Rp", "")
                          .replace(".", ",")}
                      </td>
                    )}
                  </tr>
                ))}
              <tr>
                <td className="w-[172px]">Total Harga</td>
                <td className="text-right font-semibold w-[40px]">
                  {order?.total_amount &&
                    formatCurrency(order.total_amount)
                      .replace("Rp", "")
                      .replace(".", ",")}
                </td>
              </tr>
              <tr>
                <td className="w-[172px]">Diskon</td>
                <td className="text-center w-[40px]">-</td>
              </tr>
              <tr className="font-normal">
                <td colSpan={4} className="w-[78px]"></td>
                <td className="text-left w-[95px]">Harus dibayar</td>
                <td className="text-right font-semibold w-[40px]">
                  {formatCurrency(order?.total_amount! - order?.discount!)
                    .replace("Rp", "")
                    .replace(".", ",")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Date and Status */}
        <div className="py-2 text-[7px] space-y-1">
          <div className="flex justify-start ">
            <span className="w-[78px]">Tanggal Masuk</span>
            <span className="font-bold">
              {formatDateTime(order?.createdAt)}
            </span>
          </div>
          <div className="flex justify-start">
            <span className="w-[78px]">Estimasi Selesai</span>
            <span className="font-bold">
              {formatDateTime(order?.estimated_completion)}
            </span>
          </div>
          <div className="flex justify-start font-bold">
            <span className="w-[78px]">Pembayaran</span>
            <span className="uppercase">{order?.payment_method}</span>
          </div>
          <div className="flex justify-start font-bold">
            <span className="w-[78px]">Status</span>
            <span className="uppercase">{order?.payment_status}</span>
          </div>
          {order?.payment_method === "deposit" && (
            <>
              <div className="flex justify-start font-bold">
                <span className="w-[78px]">Nilai Potong Deposit</span>
                <span className="uppercase">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
              <div className="flex justify-start font-bold">
                <span className="w-[78px]">Sisa Deposit</span>
                <span className="uppercase">
                  {formatCurrency(order.customerDetails?.deposit_balance)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="text-left text-[7px] mb-2 mt-5">Catatan</div>
        <div className="flex flex-col gap-1">
          <div className="w-full h-[0.5px] bg-black"></div>
          <p className="text-[7px] italic text-center">
            {order?.notes || "No notes"}
          </p>
          <div className="w-full h-[0.5px] bg-black"></div>
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
>(({ order, orderItems, businessInfo, receiptInfo }, ref) => {
  return (
    <div ref={ref} className="w-[58mm] p-3 bg-white text-[8px] leading-[1.1]">
      <div className="">
        <div className="py-1">
          <div className="flex items-start justify-between gap-1">
            <div className="w-fit space-y-0.5">
              <div className="font-semibold text-[8px]">
                {businessInfo.name || ""}
              </div>
              <div className="text-[7px]">{businessInfo.address || ""}</div>
              <div className="text-[7px]">{businessInfo.phone || ""}</div>
            </div>
            <div className="w-10 h-10">
              {receiptInfo?.internal_print_show_logo && (
                <img src="/pdf-logo.png" alt="Pdf logo" />
              )}
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="py-1 flex flex-col space-y-0.5 items-center text-center">
          <div className="text-center font-semibold text-[7px]">
            {receiptInfo?.internal_print_header}
          </div>
          <div className="text-center font-semibold text-[10px]">
            {order?.customerDetails?.name}
          </div>
          <div className="text-center font-semibold text-[7px]">
            Nota : {order?.order_number}
          </div>
        </div>

        {/* Items */}
        <div className="py-1 text-[8px]">
          <div className="font-bold mb-1 opacity-0">TRANSAKSI</div>
          <table className="w-full text-left">
            <tbody>
              {orderItems &&
                orderItems.map((item) => (
                  <tr key={item._id}>
                    <td className="w-[100px] text-left">
                      {item.serviceDetails?.servicename}
                    </td>
                    <td className="text-left font-bold">
                      {item.quantity}
                      {item.serviceDetails.type === "Satuan" ? " pcs" : " kg"}
                    </td>
                    <td colSpan={5}></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Date and Status */}
        <div className="pb-2 text-[8px] space-y-1">
          <div className="flex justify-start">
            <span className="w-24">Tanggal Masuk</span>
            <span className="font-bold ms-1">
              {formatDateTime(order?.createdAt)}
            </span>
          </div>
          {receiptInfo?.show_estimated_completion && (
            <div className="flex justify-start">
              <span className="w-24">Estimasi Selesai</span>
              <span className="font-bold ms-1">
                {formatDateTime(order?.estimated_completion)}
              </span>
            </div>
          )}
          {receiptInfo?.internal_print_show_payment_info && (
            <div className="flex justify-start font-bold">
              <span className="w-24">Status</span>
              <span className="uppercase ms-1">{order?.payment_status}</span>
            </div>
          )}
        </div>

        <div className="text-left text-[7px] mb-2 mt-3">Catatan</div>
        <div className="flex flex-col gap-1">
          <div className="w-full h-[0.5px] bg-black"></div>
          <p className="text-[7px] italic text-center">
            {order?.notes ||
              receiptInfo?.internal_print_free_text ||
              "No notes"}
          </p>
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
>(({ order, orderItems, businessInfo, receiptInfo }, ref) => {
  const { data: session } = useSession();

  // const totalPaid = order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalPaid = order?.total_amount;
  // const change =
  //   totalPaid > order.total_amount ? totalPaid - order.total_amount : 0;
  const paymentMethod = order?.payment_method || "N/A";

  // QR Code data string (could be plain or a URL)
  const qrData = `Order: ${order?.order_number} | Customer: ${
    order?.customerDetails?.name || "N/A"
  } | Date: ${new Date(order?.createdAt!).toLocaleDateString(
    "id-ID"
  )} | Status: ${order?.order_status}`;

  return (
    <div
      ref={ref}
      className="p-4 bg-white text-black text-xs font-mono w-[300px] mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-4">
        {receiptInfo?.original_receipt_show_logo && (
          <img src="/pdf-logo.png" className="w-20 h-auto mx-auto" />
        )}
        <h1 className="text-lg font-bold mt-[-10pxs]">{businessInfo.name}</h1>
        <p>{businessInfo.address}</p>
        <p>{businessInfo.phone}</p>
      </div>

      {/* Order Info */}
      <div className="border-t border-b border-dashed py-2 mb-2">
        <div className="flex justify-between">
          <span>Kode struk</span>
          <span>{order?.order_number}</span>
        </div>
        {receiptInfo?.payment_receipt_show_kasir_name && (
          <div className="flex justify-between">
            <span>Kasir</span>
            <span>
              {receiptInfo?.payment_receipt_kasir_name || session?.user.name}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Terima</span>
          <span>{formatDateTime(order?.createdAt)}</span>
        </div>
        {order?.estimated_completion &&
          receiptInfo?.show_estimated_completion && (
            <div className="flex justify-between">
              <span>Est.Ambil</span>
              <span>{formatDateTime(order?.estimated_completion)}</span>
            </div>
          )}
      </div>

      {/* Customer Info */}
      <div className="mb-4 flex flex-col gap-1">
        <span className="font-bold">Untuk Customer:</span>
        <span>{order?.customerDetails?.name || "N/A"}</span>
        <span>Total Lunas: {formatCurrency(order?.total_amount)}</span>
      </div>

      {/* Items */}
      <div className="border-t border-b border-dashed py-2 mb-2">
        {orderItems &&
          orderItems.map((item) => (
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
          <span className="font-bold">{formatCurrency(order?.subtotal)}</span>
        </div>
        {order?.discount! > 0 && (
          <div className="flex justify-between">
            <span>Diskon:</span>
            <span>{formatCurrency(order?.discount)}</span>
          </div>
        )}
        {order?.tax! > 0 && (
          <div className="flex justify-between">
            <span>Pajak:</span>
            <span>{formatCurrency(order?.tax)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base mt-1">
          <span>Grand Total:</span>
          <span>{formatCurrency(order?.total_amount)}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Pembayaran: </span>
          <span>{paymentMethod.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Status Bayar:</span>
          <span>{order?.payment_status?.toUpperCase()}</span>
        </div>
        {totalPaid! > 0 && (
          <div className="flex justify-between">
            <span>Jumlah Bayar:</span>
            <span>{formatCurrency(totalPaid)}</span>
          </div>
        )}
        {order?.payment_method === "deposit" &&
          receiptInfo?.show_customer_deposit && (
            <div className="flex justify-between">
              <span>Sisa Deposit:</span>
              <span>
                {order.customerDetails &&
                  formatCurrency(order.customerDetails?.deposit_balance)}
              </span>
            </div>
          )}

        {/* {change > 0 && (
          <div className="flex justify-between">
            <span>Kembali:</span>
            <span>{formatCurrency(change)}</span>
          </div>
        )} */}
      </div>

      {/* Terms */}
      <div className="mt-3 mb-5">
        <div className="mb-1">Ketentuan Penting:</div>
        <div className=" flex flex-col gap-2">
          <p className="flex gap-1 p-0 m-0">
            <span>
              <Dot size={16} />
            </span>
            {receiptInfo?.original_receipt_terms_condition_1}
          </p>
          <p className="flex gap-1 p-0 m-0">
            <span>
              <Dot size={16} />
            </span>
            {receiptInfo?.original_receipt_terms_condition_2}
          </p>
        </div>
      </div>

      {/* Customer Service */}
      <div className="mt-5 mb-5">
        <div className="font-bold">
          Customer Service :
          <span className="text-black font-bold">
            {receiptInfo?.original_receipt_customer_service}
          </span>
        </div>
        <div className="font-bold">{receiptInfo?.original_receipt_hashtag}</div>
      </div>

      {/* QR Code */}
      {receiptInfo?.original_receipt_show_qr && (
        <div className="flex flex-col items-center mt-5">
          <QRCodeCanvas value={qrData} size={128} level="H" />
          <div className="text-[8px] text-center max-w-[280px] break-words mt-2">
            <p className="font-bold">QR Data:</p>
            <p>{qrData}</p>
          </div>
        </div>
      )}
    </div>
  );
});

// Template 4:
export const DepositReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  ReceiptTemplateProps
>(({ customer, businessInfo }, ref) => {
  const { currentBranchId } = useBranch();
  const dispatch = useDispatch<AppDispatch>();
  const [depositType, setDepositType] = useState<DepositType | undefined>(
    undefined
  );
  const { items } = useSelector((state: RootState) => state.depositTypes);

  useEffect(() => {
    if (currentBranchId) {
      dispatch(fetchDepositTypes(currentBranchId));
    }
  }, [dispatch, currentBranchId]);

  useEffect(() => {
    if (customer) {
      const depositType = items.find(
        (depo) => depo._id === customer?.deposit_type_id
      );
      setDepositType(depositType);
    }
  }, [customer]);

  return (
    <div ref={ref} className="w-[200px] p-3 bg-white text-[6px] leading-[1.1]">
      <div className="">
        <div className="py-1">
          <div className="flex items-start justify-between gap-1">
            <div className="w-[160px] space-y-0.5">
              <div className="font-semibold text-[7px]">
                {businessInfo.name || ""}
              </div>
              <div className="text-[6px]">{businessInfo.address || ""}</div>
              <div className="text-[6px]">{businessInfo.phone || ""}</div>
            </div>
            <div className="w-10 h-10">
              <img src="/pdf-logo.png" alt="Pdf logo" />
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="py-1 flex flex-col space-y-0.5 items-center text-center">
          <div className="text-center font-semibold text-[6px]">
            Nota Deposit
          </div>
          <div className="text-center font-semibold text-[8px]">
            {customer?.name}
          </div>
          <div className="text-center font-semibold text-[6px]">
            Nota : DP{customer?._id.slice(0, 5).toUpperCase()}
          </div>
        </div>

        {/* Items */}
        <div className="py-1 text-[7px]">
          <div className="font-bold mb-1 opacity-0">Deposit Info</div>
          <div className="pb-2 text-[7px] space-y-1">
            <div className="flex justify-start">
              <span className="w-20">Deposit Type</span>
              <span className="font-bold ms-2 text-left w-[150px]">
                {customer?.deposit_type}
              </span>
            </div>
            <div className="flex justify-start">
              <span className="w-20">Deposit Purchase Price</span>
              <span className="font-bold ms-2 text-left w-[150px]">
                {formatCurrency(depositType?.purchase_price)}
              </span>
            </div>
            <div className="flex justify-start font-bold">
              <span className="w-20">Deposit Value</span>
              <span className="uppercase ms-2 text-left w-[150px]">
                {" "}
                {formatCurrency(depositType?.deposit_value)}
              </span>
            </div>
            {customer?.has_expiry && customer.expiry_date && (
              <div className="flex justify-start font-bold">
                <span className="w-20">Expire Date</span>
                <span className="uppercase ms-2 text-left w-[150px]">
                  {formatDateTime(customer?.expiry_date)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="text-left text-[7px] mb-2 mt-3 opacity-0">Catatan</div>
        <div className="flex flex-col gap-1 opacity-0">
          <div className="w-full h-[0.5px] bg-black "></div>
          <p className="text-[7px] italic text-center">No notes</p>
          <div className="w-full h-[0.5px] bg-black"></div>
        </div>
      </div>
    </div>
  );
});

CashTransferReceiptTemplate.displayName = "CashTransferReceiptTemplate";
InternalReceiptTemplate.displayName = "InternalReceiptTemplate";
ReceiptTemplate.displayName = "ReceiptTemplate";
DepositReceiptTemplate.displayName = "DepositReceiptTemplate";
