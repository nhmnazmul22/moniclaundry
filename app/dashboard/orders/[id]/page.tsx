"use client";

import type React from "react";

import {
  CashTransferReceiptTemplate,
  DepositReceiptTemplate,
  InternalReceiptTemplate,
  ReceiptTemplate,
} from "@/components/receipt-template";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/config/axios";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import { fetchOrderItems } from "@/store/OrderItemSlice";
import { Branches, type Customer, type Order } from "@/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Edit,
  Loader2,
  MessageSquare,
  Package,
  Phone,
  Printer,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [branch, setBranch] = useState<Branches | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<
    Order["order_status"] | ""
  >("");
  const [pdfLoading, setPdfLoading] = useState(false);

  const { toast } = useToast();
  const receiptTemplate = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const cashTransferRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const depositRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const internalRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  const { items: branches } = useSelector(
    (state: RootState) => state.branchReducer
  );
  const { items: orderItems } = useSelector(
    (state: RootState) => state.orderItemsReducer
  );

  const fetchOrderData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/api/orders/${orderId}`);
      const branch = branches?.find(
        (b) => b._id === res.data.data.current_branch_id
      );
      setBranch(branch);
      setOrder(res.data.data);
      setCustomer(res.data.data.customerDetails);
      setCurrentStatus(res.data.data.order_status);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data order.");
      toast({
        title: "Error",
        description: `Gagal memuat data order: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderItems(orderId));
      fetchOrderData();
    }
  }, [orderId]);

  const handleDeleteOrder = async () => {
    try {
      // Delete order items first
      const res = await api.delete(`/api/order-items?order_id=${orderId}`);

      if (res.status !== 200) {
        toast({
          title: "Order items delete filed",
          description: `${res.statusText}`,
        });
        return;
      }

      // Delete order
      const orderRes = await api.delete(`/api/orders/${orderId}`);

      if (orderRes.status !== 200) {
        toast({
          title: "Order delete filed",
          description: `${res.statusText}`,
        });
        return;
      }

      toast({ title: "Sukses", description: "Order berhasil dihapus." });
      router.push("/dashboard/orders");
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Gagal menghapus order: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: Order["order_status"]) => {
    if (!order) return;

    const res = await api.put(`/api/orders/${orderId}`, {
      order_status: newStatus,
    });

    if (res.status !== 201) {
      toast({
        title: "Error",
        description: `Gagal memperbarui status: ${res.statusText}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukses",
        description: `Status order diperbarui menjadi ${getStatusLabel(
          newStatus
        )}.`,
      });
      setOrder((prev) => (prev ? { ...prev, order_status: newStatus } : null));
      setCurrentStatus(newStatus);
    }
  };

  const generatePDF = async (
    templateRef: React.RefObject<HTMLDivElement>,
    filename: string,
    shouldPrint: boolean = false
  ) => {
    if (!templateRef.current) {
      toast({
        title: "Error",
        description: "Gagal menemukan template nota.",
        variant: "destructive",
      });
      return;
    }

    setPdfLoading(true);

    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const pxToMm = (px: number) => px * 0.264583;
      const mmToPx = (mm: number) => mm / 0.264583;

      const imgWidthMm = 58;
      const imgWidthPx = mmToPx(imgWidthMm);
      const scaleFactor = imgWidthPx / canvas.width;
      const imgHeightMm = pxToMm(canvas.height * scaleFactor);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [imgWidthMm, imgHeightMm],
      });

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        imgWidthMm,
        imgHeightMm
      );

      if (shouldPrint) {
        pdf.autoPrint();
        const printBlob = pdf.output("bloburl");
        window.open(printBlob);
      } else {
        pdf.save(`${filename}-${order?.order_number}.pdf`);
      }

      toast({
        title: shouldPrint ? "Cetak" : "Sukses",
        description: shouldPrint
          ? `${filename} siap dicetak.`
          : `${filename} berhasil diunduh.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Gagal proses nota: ${err.message}`,
        variant: "destructive",
      });
      console.error("PDF generation error:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrintReceipt = async () => {
    await generatePDF(receiptTemplate!, "nota-original", true);
  };

  const handleDownloadCashTransfer = async () => {
    await generatePDF(cashTransferRef, "nota-cash-transfer");
  };

  const handleDownloadDeposit = async () => {
    await generatePDF(depositRef, "nota-deposit");
  };

  const handleDownloadInternal = async () => {
    await generatePDF(internalRef, "nota-internal");
  };

  const handleWhatsAppNotification = () => {
    if (!customer?.phone) {
      toast({
        title: "Error",
        description: "Nomor telepon pelanggan tidak tersedia.",
        variant: "destructive",
      });
      return;
    }

    const cleanedPhoneNumber = customer.phone.replace(/\D/g, ""); // Remove non-digits
    const whatsappNumber = cleanedPhoneNumber.startsWith("62")
      ? cleanedPhoneNumber
      : `62${cleanedPhoneNumber.substring(1)}`; // Ensure starts with 62

    const statusMessage = getStatusLabel(currentStatus as string);
    const message = `Halo ${customer.name}, laundry Anda dengan nomor order ${
      order?.order_number
    } sudah ${statusMessage.toLowerCase()}. Terima kasih telah mempercayakan laundry Anda kepada Monic Laundry Galaxy. Kami berkomitmen memberikan pelayanan terbaik untuk Anda! 🧺✨`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      diterima: "Diterima",
      diproses: "Diproses",
      selesai: "Selesai",
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const colors: { [key: string]: string } = {
      "belum lunas": "bg-yellow-100 text-yellow-800",
      lunas: "bg-green-100 text-green-800",
      dp: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const selectedBranch = (id: string) => {
    const branch = branches?.find((b) => b._id === id);
    return branch || null;
  };

  if (loading && !order) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p>Memuat detail order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg">
          {error || "Order tidak ditemukan"}
        </p>
        <Link href="/dashboard/orders">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Orders
          </Button>
        </Link>
      </div>
    );
  }

  // Dummy business info for receipt
  const businessInfo = {
    name:
      selectedBranch(order.current_branch_id || "")?.name ||
      "Monic Laundry Galaxy",
    address:
      selectedBranch(order.current_branch_id || "")?.address ||
      "Jl. Taman Galaxy Raya No 301 E",
    phone:
      selectedBranch(order.current_branch_id || "")?.phone || "+6287710108075",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Order</h1>
            <p className="text-muted-foreground">Order #{order.order_number}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handlePrintReceipt}
            disabled={pdfLoading}
          >
            <Printer className="mr-2 h-4 w-4" />
            Cetak Nota Original
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={pdfLoading}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
                {pdfLoading && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDownloadCashTransfer}>
                <Download className="mr-2 h-4 w-4" />
                Cash/Transfer/QRIS
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadDeposit}>
                <Download className="mr-2 h-4 w-4" />
                Deposit Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadInternal}>
                <Download className="mr-2 h-4 w-4" />
                Internal Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={`/dashboard/orders/edit/${order._id}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={handleDeleteOrder}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Informasi Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diterima">Diterima</SelectItem>
                  <SelectItem value="diproses">Diproses</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {order.order_status === "selesai" && customer?.phone && (
              <Button
                onClick={handleWhatsAppNotification}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Kirim Notifikasi WhatsApp
              </Button>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total:</span>
              <span className="font-semibold">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Pembayaran:</span>
              <Badge className={getPaymentStatusColor(order.payment_status)}>
                {order.payment_status?.toUpperCase() || "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tanggal Order:</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            {order.estimated_completion && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Estimasi Selesai:</span>
                <span>{formatDateTime(order.estimated_completion)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-sm font-medium">Branch Name:</span>
              <span>{businessInfo.name || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              Informasi Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer ? (
              <>
                <div>
                  <span className="text-sm font-medium">Nama:</span>
                  <p className="font-semibold">{customer.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Telepon:</span>
                  <p>{customer.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Email:</span>
                  <p>{customer.email || "Tidak ada"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Alamat:</span>
                  <p>{customer.address || "Tidak ada"}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Data customer tidak tersedia
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Item Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Berat (kg)</TableHead>
                <TableHead>Harga per Kg</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems &&
                orderItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="font-medium">
                        {item.serviceDetails?.servicename! || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity} kg</TableCell>
                    <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                    <TableCell>{item.notes || "-"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hidden Receipt Templates for PDF Generation */}
      <div className="absolute -left-[9999px] -top-[9999px]">
        {order && (
          <>
            <ReceiptTemplate
              ref={receiptTemplate}
              order={order}
              orderItems={orderItems!}
              businessInfo={businessInfo}
            />
            <CashTransferReceiptTemplate
              ref={cashTransferRef}
              order={order}
              orderItems={orderItems!}
              businessInfo={businessInfo}
            />
            <DepositReceiptTemplate
              ref={depositRef}
              order={order}
              orderItems={orderItems!}
              businessInfo={businessInfo}
            />
            <InternalReceiptTemplate
              ref={internalRef}
              order={order}
              orderItems={orderItems!}
              businessInfo={businessInfo}
            />
          </>
        )}
      </div>
    </div>
  );
}
