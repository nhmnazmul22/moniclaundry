"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useBranch } from "@/contexts/branch-context";
import { getOrders } from "@/lib/data";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Banknote,
  CreditCard,
  Eye,
  Loader2,
  Plus,
  Search,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

type Payment = {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  status: string;
  created_at: string;
  order?: {
    order_number: string;
    customer?: {
      name: string;
      phone: string;
    };
    total_amount: number;
  };
};

export default function PaymentsPage() {
  const { currentBranchId } = useBranch();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Form states
  const [selectedOrder, setSelectedOrder] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("tunai");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const { toast } = useToast();

  const fetchPayments = async () => {
    try {
      let query = supabase
        .from("payments")
        .select(
          `
          *,
          orders (
            order_number,
            total_amount,
            customers (
              name,
              phone
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (currentBranchId) {
        query = query.eq("current_branch_id", currentBranchId);
      }

      const { data, error } = await query;
      console.log("Payments data:", data);
      if (error) {
        console.error("Error fetching payments:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching payments:", error);
      return [];
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersData = await getOrders(currentBranchId);
      // Filter orders that can have payments (completed, delivered, or ready)
      const payableOrders = ordersData.filter((order: any) => {
        const validStatuses = [
          "completed",
          "delivered",
          "ready",
          "in_progress",
        ];
        return validStatuses.includes(order.order_status);
      });
      return payableOrders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentsData, ordersData] = await Promise.all([
        fetchPayments(),
        fetchOrders(),
      ]);

      console.log("Orders data for payments:", ordersData);
      console.log("Payments data:", paymentsData);

      setPayments(paymentsData as Payment[]);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pembayaran.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBranchId]);

  // Update amount when order is selected
  useEffect(() => {
    if (selectedOrder) {
      const order = orders.find((o) => o.id === selectedOrder);
      if (order) {
        setAmount(order.total_amount || 0);
      }
    }
  }, [selectedOrder, orders]);

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "tunai":
        return <Banknote className="h-4 w-4" />;
      case "transfer":
      case "bank":
        return <CreditCard className="h-4 w-4" />;
      case "e-wallet":
      case "gopay":
      case "ovo":
      case "dana":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "Pending",
      completed: "Selesai",
      failed: "Gagal",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  const handleCreatePayment = async () => {
    if (!selectedOrder || !amount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newPayment = {
        order_id: selectedOrder,
        amount: amount,
        payment_method: paymentMethod,
        payment_date: new Date(paymentDate).toISOString(),
        reference_number: referenceNumber || null,
        notes: notes || null,
        status: "completed", // Default to completed for manual entry
      };

      const { data, error } = await supabase
        .from("payments")
        .insert(newPayment)
        .select()
        .single();

      if (error) {
        console.error("Error creating payment:", error);
        toast({
          title: "Error",
          description: `Gagal membuat pembayaran: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sukses",
          description: "Pembayaran berhasil ditambahkan.",
        });
        setIsModalOpen(false);
        loadData(); // Refresh data
        // Reset form
        setSelectedOrder("");
        setAmount(0);
        setPaymentMethod("tunai");
        setPaymentDate(new Date().toISOString().split("T")[0]);
        setReferenceNumber("");
        setNotes("");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan yang tidak terduga.",
        variant: "destructive",
      });
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pembayaran ini?")) return;

    const { error } = await supabase.from("payments").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `Gagal menghapus pembayaran: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukses",
        description: "Pembayaran berhasil dihapus.",
      });
      loadData();
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.order?.order_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.order?.customer?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.reference_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" || payment.payment_method === methodFilter;

    return matchesSearch || matchesStatus || matchesMethod;
  });

  const stats = {
    totalRevenue: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: payments.length,
    avgTransaction:
      payments.length > 0
        ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length
        : 0,
    pendingPayments: payments.filter((p) => p.status === "pending").length,
  };

  if (loading) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p>Memuat data pembayaran...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payments Management
          </h1>
          <p className="text-muted-foreground">
            Kelola pembayaran dan transaksi keuangan
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Tambah Pembayaran Baru</DialogTitle>
              <DialogDescription>
                Input detail pembayaran baru.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right">
                  Order
                </Label>
                <Select onValueChange={setSelectedOrder} value={selectedOrder}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.order_number} - {order.customer?.name} (
                        {formatCurrency(order.total_amount)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Jumlah
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number.parseInt(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentMethod" className="text-right">
                  Metode
                </Label>
                <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="gopay">GoPay</SelectItem>
                    <SelectItem value="ovo">OVO</SelectItem>
                    <SelectItem value="dana">DANA</SelectItem>
                    <SelectItem value="shopeepay">ShopeePay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentDate" className="text-right">
                  Tanggal Bayar
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="referenceNumber" className="text-right">
                  No. Referensi
                </Label>
                <Input
                  id="referenceNumber"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="col-span-3"
                  placeholder="Opsional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Catatan
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="button" onClick={handleCreatePayment}>
                Simpan Pembayaran
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              dari {stats.totalTransactions} transaksi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">pembayaran tercatat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.avgTransaction)}
            </div>
            <p className="text-xs text-muted-foreground">
              rata-rata per transaksi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingPayments}
            </div>
            <p className="text-xs text-muted-foreground">menunggu konfirmasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari order number, customer, referensi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="failed">Gagal</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Metode</SelectItem>
                <SelectItem value="tunai">Tunai</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="gopay">GoPay</SelectItem>
                <SelectItem value="ovo">OVO</SelectItem>
                <SelectItem value="dana">DANA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Payments ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Info</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Tanggal Bayar</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {payment.order?.order_number || payment.order_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {payment.id.substring(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {payment.order?.customer?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.order?.customer?.phone || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(payment.amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(payment.payment_method)}
                      <span className="capitalize">
                        {payment.payment_method}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(payment.payment_date)}</TableCell>
                  <TableCell>
                    <div className="text-sm font-mono">
                      {payment.reference_number || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)}>
                      {getStatusLabel(payment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPayment(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeletePayment(payment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pembayaran</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Order Number
                  </Label>
                  <p className="text-sm">
                    {selectedPayment.order?.order_number ||
                      selectedPayment.order_id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Customer
                  </Label>
                  <p className="text-sm">
                    {selectedPayment.order?.customer?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Amount
                  </Label>
                  <p className="text-sm font-bold">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Payment Method
                  </Label>
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon(selectedPayment.payment_method)}
                    <span className="capitalize">
                      {selectedPayment.payment_method}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Payment Date
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedPayment.payment_date)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    {getStatusLabel(selectedPayment.status)}
                  </Badge>
                </div>
                {selectedPayment.reference_number && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Reference Number
                    </Label>
                    <p className="text-sm font-mono">
                      {selectedPayment.reference_number}
                    </p>
                  </div>
                )}
                {selectedPayment.notes && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">
                      Notes
                    </Label>
                    <p className="text-sm">{selectedPayment.notes}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Created At
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedPayment.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
