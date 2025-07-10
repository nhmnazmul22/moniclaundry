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
import { useBranch } from "@/contexts/branch-context";
import { toast } from "@/hooks/use-toast";
import { addNotification } from "@/lib/api";
import api from "@/lib/config/axios";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import { fetchDelivery } from "@/store/DeliverySlice";
import { fetchNotification } from "@/store/NotificationSlice";
import { fetchOrders } from "@/store/orderSlice";
import { fetchUsers } from "@/store/StaffSlice";
import { Customer, Delivery, NotificationType, Order, User } from "@/types";
import {
  AlertTriangle,
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DeliveriesPage() {
  const { data: session } = useSession();
  const { currentBranchId } = useBranch();
  const [branchId, setBranchId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [kurirList, setKurirList] = useState<User[]>([]);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedKurir, setSelectedKurir] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">(
    "delivery"
  );
  const [deliveryStatus, setDeliveryStatus] = useState<string>("scheduled");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [deliveryFee, setDeliveryFee] = useState<number>(5000);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const dispatch = useDispatch<AppDispatch>();

  const { items: deliveries, loading: deliveryLoading } = useSelector(
    (state: RootState) => state.deliveryReducer
  );
  const { items: staffData } = useSelector(
    (state: RootState) => state.staffsReducer
  );
  const { items: ordersData } = useSelector(
    (state: RootState) => state.orderReducer
  );

  useEffect(() => {
    dispatch(fetchDelivery(currentBranchId));
    dispatch(fetchOrders(currentBranchId));
  }, [currentBranchId]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Filter orders that can be delivered (completed or ready)
      const availableOrders = ordersData?.filter((o: any) => {
        const validStatuses = ["selesai"];
        return validStatuses.includes(o.order_status);
      });

      setKurirList(staffData?.filter((s: any) => s.role === "kurir") || []);
      setOrderList(availableOrders || []);
    } catch (e) {
      setError("Terjadi kesalahan saat memuat data.");
      console.error("Error in fetchPageData:", e);
    } finally {
      setLoading(false);
    }
  }, [staffData, ordersData, currentBranchId]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData, currentBranchId]);

  useEffect(() => {
    if (selectedOrder) {
      const order = orderList.find((o) => o._id === selectedOrder);
      if (order && order.customerDetails) {
        setCustomer(order.customerDetails || null);
        setBranchId(order.customerDetails.current_branch_id || "");
      } else {
        setCustomer(null);
        setBranchId("");
      }
    }
  }, [selectedOrder, orderList]);

  const getStatusLabel = (status?: string) => {
    if (!status) return "N/A";
    const labels: { [key: string]: string } = {
      scheduled: "Dijadwalkan",
      in_progress: "Sedang Berlangsung",
      completed: "Selesai",
      failed: "Gagal",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  const getDeliveryStatusColor = (status?: string) => {
    if (!status) return "bg-gray-200 text-gray-800";
    const colors: { [key: string]: string } = {
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-200 text-gray-800";
  };

  const handleViewDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsViewDialogOpen(true);
  };

  const handleEditDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setSelectedOrder(delivery.order_id);
    setSelectedKurir(delivery.kurir_id);
    setDeliveryType(delivery.delivery_type);
    setScheduledTime(delivery.scheduled_time.slice(0, 16)); // Format for datetime-local
    setCustomer(delivery.customer || null);
    setDeliveryFee(delivery.delivery_fee || 0);
    setBranchId(delivery.orderDetails?.current_branch_id || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateDelivery = async () => {
    if (
      !selectedDelivery ||
      !selectedOrder ||
      !selectedKurir ||
      !scheduledTime
    ) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedDelivery = {
        order_id: selectedOrder,
        kurir_id: selectedKurir,
        status: deliveryStatus,
        delivery_type: deliveryType,
        scheduled_time: new Date(scheduledTime).toISOString(),
        delivery_fee: deliveryType === "delivery" ? deliveryFee : 0,
        notes: `${
          deliveryType === "delivery" ? "Pengiriman" : "Pickup"
        } diupdate`,
      };

      const res = await api.put(
        `/api/deliveries/${selectedDelivery._id}`,
        updatedDelivery
      );

      if (res.status !== 201) {
        console.error("Update error:", res.statusText);
        toast({
          title: "Error",
          description: `Gagal mengupdate pengiriman: ${res.statusText}`,
          variant: "destructive",
        });
      } else {
        const notificationData: NotificationType = {
          title: "Delivery updated successfully.",
          description: `Delivery ${selectedDelivery._id} info is updated`,
          status: "unread",
          current_branch_id: currentBranchId,
        };
        // Send a notification
        const res = await addNotification(notificationData);
        if (res?.status === 201) {
          dispatch(fetchNotification(currentBranchId));
        }
        toast({
          title: "Sukses",
          description: "Pengiriman berhasil diupdate.",
        });
        setIsEditDialogOpen(false);
        setSelectedDelivery(null);
        fetchPageData();
        dispatch(fetchDelivery(currentBranchId));
        setSelectedOrder("");
        setSelectedKurir("");
        setDeliveryType("delivery");
        setScheduledTime("");
        setDeliveryFee(5000);
        setCustomer(null);
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

  const handleDelete = async (id: string) => {
    setLoading(true);
    const res = await api.delete(`/api/deliveries/${id}`);

    if (res.status !== 200) {
      toast({
        title: "Error",
        description: `Gagal menghapus pengiriman: ${res.statusText}`,
        variant: "destructive",
      });
    } else {
      const notificationData: NotificationType = {
        title: "Delivery deleted successfully.",
        description: `Delivery ${id} is deleted`,
        status: "unread",
        current_branch_id: currentBranchId,
      };
      // Send a notification
      const res = await addNotification(notificationData);
      if (res?.status === 201) {
        dispatch(fetchNotification(currentBranchId));
      }
      toast({ title: "Sukses", description: "Pengiriman berhasil dihapus." });
      fetchPageData();
      dispatch(fetchDelivery(currentBranchId));
      setLoading(false);
    }
  };

  const handleCreateDelivery = async () => {
    if (!selectedOrder || !selectedKurir || !scheduledTime) {
      console.log("Validation failed:", {
        selectedOrder,
        selectedKurir,
        scheduledTime,
      });
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newDelivery = {
        order_id: selectedOrder,
        kurir_id: selectedKurir,
        delivery_type: deliveryType,
        scheduled_time: new Date(scheduledTime).toISOString(),
        status: deliveryStatus || "scheduled",
        customer: deliveryType === "delivery" ? customer : null,
        delivery_fee: deliveryType === "delivery" ? deliveryFee : 0,
        notes: `${
          deliveryType === "delivery" ? "Pengiriman" : "Pickup"
        } dijadwalkan`,
        current_branch_id: branchId,
      };

      const res = await api.post("/api/deliveries", newDelivery);

      if (res.status !== 201) {
        toast({
          title: "Error",
          description: `Gagal membuat jadwal pengiriman: ${res.statusText}`,
          variant: "destructive",
        });
      } else {
        const notificationData: NotificationType = {
          title: "Delivery Created successfully.",
          description: `New delivery for order ${newDelivery.order_id} created`,
          status: "unread",
          current_branch_id: currentBranchId,
        };
        // Send a notification
        const res = await addNotification(notificationData);
        if (res?.status === 201) {
          dispatch(fetchNotification(currentBranchId));
        }

        toast({
          title: "Sukses",
          description: "Jadwal pengiriman berhasil dibuat.",
        });
        setIsModalOpen(false);
        dispatch(fetchDelivery(currentBranchId));
        fetchPageData();
        setSelectedOrder("");
        setSelectedKurir("");
        setDeliveryType("delivery");
        setScheduledTime("");
        setDeliveryFee(5000);
        setCustomer(null);
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

  // 1. First filter by status
  const statusFilteredDelivery = deliveries?.filter((delivery) => {
    return statusFilter === "all" || delivery.status === statusFilter;
  });

  // 2. Then filter by search term
  const filteredDelivery = statusFilteredDelivery?.filter((delivery) => {
    const search = searchTerm.toLowerCase();
    return (
      delivery.orderDetails?.order_number?.toLowerCase().includes(search) ||
      delivery.customer?.name?.toLowerCase().includes(search) ||
      delivery.kurirDetails?.email?.includes(search)
    );
  });

  if (deliveryLoading && deliveries?.length === 0) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p>Memuat data pengiriman...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg">{error}</p>
        <Button onClick={fetchPageData} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  const stats = {
    total: deliveries?.length,
    scheduled: deliveries?.filter((d) => d.status === "scheduled").length,
    in_progress: deliveries?.filter((d) => d.status === "in_progress").length,
    completed: deliveries?.filter((d) => d.status === "completed").length,
    failed: deliveries?.filter((d) => d.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex max-sm:flex-col gap-3 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Deliveries Management
          </h1>
          <p className="text-muted-foreground">
            Kelola pengiriman dan pickup laundry
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Jadwalkan Delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Jadwalkan Pengiriman/Pickup Baru</DialogTitle>
              <DialogDescription>
                Isi detail untuk jadwal pengiriman atau pickup baru.
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
                    {orderList.map((order) => (
                      <SelectItem key={order._id} value={order._id}>
                        {order.order_number} - {order.customerDetails?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kurir" className="text-right">
                  Kurir
                </Label>
                <Select onValueChange={setSelectedKurir} value={selectedKurir}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Kurir" />
                  </SelectTrigger>
                  <SelectContent>
                    {kurirList.map((kurir) => (
                      <SelectItem key={kurir._id} value={kurir._id!}>
                        {kurir.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deliveryType" className="text-right">
                  Tipe
                </Label>
                <Select
                  onValueChange={(value) =>
                    setDeliveryType(value as "pickup" | "delivery")
                  }
                  value={deliveryType}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">
                      Pengiriman ke Customer
                    </SelectItem>
                    <SelectItem value="pickup">Pickup dari Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deliveryStatus" className="text-right">
                  Status
                </Label>
                <Select
                  onValueChange={setDeliveryStatus}
                  value={deliveryStatus}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scheduledTime" className="text-right">
                  Waktu Dijadwalkan
                </Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="col-span-3"
                />
              </div>

              {deliveryType === "delivery" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deliveryFee" className="text-right">
                      Ongkir
                    </Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      value={deliveryFee}
                      onChange={(e) =>
                        setDeliveryFee(Number.parseInt(e.target.value))
                      }
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="button" onClick={handleCreateDelivery}>
                Simpan Jadwal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dijadwalkan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.scheduled}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berlangsung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.in_progress}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gagal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.failed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex max-sm:flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari order number, nama customer, kurir..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="scheduled">Dijadwalkan</SelectItem>
                <SelectItem value="in_progress">Berlangsung</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="failed">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Deliveries ({deliveries?.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Info</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Kurir</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Waktu Dijadwalkan</TableHead>
                <TableHead>Waktu Aktual</TableHead>
                <TableHead>Ongkir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries &&
                filteredDelivery!.map((delivery) => (
                  <TableRow key={delivery._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {delivery.orderDetails?.order_number ||
                            delivery.order_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {delivery._id.substring(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {delivery.customer?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.customer?.phone || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {delivery.kurirDetails?.full_name || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          delivery.delivery_type === "delivery"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {delivery.delivery_type === "delivery"
                          ? "Pengiriman"
                          : "Pickup"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateTime(delivery.scheduled_time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {delivery.actual_time
                          ? formatDateTime(delivery.actual_time)
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(delivery.delivery_fee)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getDeliveryStatusColor(delivery.status)}
                      >
                        {getStatusLabel(delivery.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDelivery(delivery)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDelivery(delivery)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(session?.user.role === "owner" ||
                          session?.user.role === "admin") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(delivery._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
            <DialogTitle>Detail Pengiriman</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Order Number
                  </Label>
                  <p className="text-sm">
                    {selectedDelivery.orderDetails?.order_number ||
                      selectedDelivery.order_id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Customer
                  </Label>
                  <p className="text-sm">
                    {selectedDelivery.customer?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Kurir
                  </Label>
                  <p className="text-sm">
                    {selectedDelivery.kurirDetails?.full_name || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Tipe
                  </Label>
                  <p className="text-sm">
                    {selectedDelivery.delivery_type === "delivery"
                      ? "Pengiriman"
                      : "Pickup"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Waktu Dijadwalkan
                  </Label>
                  <p className="text-sm">
                    {formatDateTime(selectedDelivery.scheduled_time)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Waktu Aktual
                  </Label>
                  <p className="text-sm">
                    {selectedDelivery.actual_time
                      ? formatDateTime(selectedDelivery.actual_time)
                      : "Belum selesai"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge
                    className={getDeliveryStatusColor(selectedDelivery.status)}
                  >
                    {getStatusLabel(selectedDelivery.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Ongkir
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(selectedDelivery.delivery_fee)}
                  </p>
                </div>
                {selectedDelivery.customer?.address && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">
                      Alamat Pengiriman
                    </Label>
                    <p className="text-sm">
                      {selectedDelivery.customer.address}
                    </p>
                  </div>
                )}
                {selectedDelivery.notes && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">
                      Catatan
                    </Label>
                    <p className="text-sm">{selectedDelivery.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Pengiriman</DialogTitle>
            <DialogDescription>
              Update detail pengiriman atau pickup.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-order" className="text-right">
                Order
              </Label>
              <Select onValueChange={setSelectedOrder} value={selectedOrder}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Order" />
                </SelectTrigger>
                <SelectContent>
                  {orderList.map((order) => (
                    <SelectItem key={order._id} value={order._id}>
                      {order.order_number} - {order.customerDetails?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-kurir" className="text-right">
                Kurir
              </Label>
              <Select onValueChange={setSelectedKurir} value={selectedKurir}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Kurir" />
                </SelectTrigger>
                <SelectContent>
                  {kurirList.map((kurir) => (
                    <SelectItem key={kurir._id} value={kurir._id!}>
                      {kurir.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-deliveryType" className="text-right">
                Tipe
              </Label>
              <Select
                onValueChange={(value) =>
                  setDeliveryType(value as "pickup" | "delivery")
                }
                value={deliveryType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">
                    Pengiriman ke Customer
                  </SelectItem>
                  <SelectItem value="pickup">Pickup dari Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deliveryStatus" className="text-right">
                Status
              </Label>
              <Select onValueChange={setDeliveryStatus} value={deliveryStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-scheduledTime" className="text-right">
                Waktu Dijadwalkan
              </Label>
              <Input
                id="edit-scheduledTime"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            {deliveryType === "delivery" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-deliveryFee" className="text-right">
                    Ongkir
                  </Label>
                  <Input
                    id="edit-deliveryFee"
                    type="number"
                    value={deliveryFee}
                    onChange={(e) =>
                      setDeliveryFee(Number.parseInt(e.target.value))
                    }
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedDelivery(null);
              }}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleUpdateDelivery}>
              Update Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
