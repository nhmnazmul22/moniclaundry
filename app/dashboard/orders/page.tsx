"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import api from "@/lib/config/axios";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
} from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import { fetchOrders } from "@/store/orderSlice";
import { Edit, Eye, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currentBranchId } = useBranch();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const dispatch = useDispatch<AppDispatch>();
  const { items: orders, loading: ordersLoading } = useSelector(
    (state: RootState) => state.orderReducer
  );

  useEffect(() => {
    dispatch(fetchOrders(currentBranchId));
  }, [currentBranchId]);

  // 1. First filter by status
  const statusFilteredOrders = orders?.filter((order) => {
    return statusFilter === "all" || order.order_status === statusFilter;
  });

  // 2. Then filter by search term
  const filteredOrders = statusFilteredOrders?.filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(search) ||
      order.customerDetails?.name?.toLowerCase().includes(search) ||
      order.customerDetails?.phone?.includes(search)
    );
  });

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      diterima: "diterima",
      diproses: "diproses",
      selesai: "selesai",
    };
    return (
      labels[status].charAt(0).toUpperCase() + status.slice(1) ||
      status.charAt(0).toUpperCase() + status.slice(1)
    );
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const colors: { [key: string]: string } = {
      "belum lunas":
        "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800",
      lunas:
        "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800",
      dp: "bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleEditOrder = (orderId: string) => {
    router.push(`/dashboard/orders/edit/${orderId}`);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const orderItemRes = await api.delete(
        `/api/order-items?order_id=${orderId}`
      );

      if (orderItemRes.status !== 200) {
        toast.error("Order items delete failed");
        return;
      }

      const orderRes = await api.delete(`/api/orders/${orderId}`);

      if (orderRes.status !== 200) {
        toast.error("Order items delete failed");
        return;
      }

      alert("Order berhasil dihapus.");
      dispatch(fetchOrders(currentBranchId)); // Refresh data
    } catch (err: any) {
      alert(`Gagal menghapus order: ${err.message}`);
    }
  };

  const stats = {
    total: orders?.length,
    accepted: orders?.filter((o) => o.order_status === "diterima").length,
    pending: orders?.filter((o) => o.order_status === "diproses").length,
    delivered: orders?.filter((o) => o.order_status === "selesai").length,
  };

  if (ordersLoading) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p>Memuat data order...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Orders Management
          </h1>
          <p className="text-muted-foreground">Kelola semua pesanan laundry</p>
        </div>
        <Link href="/dashboard/orders/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Order Baru
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diterima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.accepted}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sedang Diproses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {stats.delivered}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari order number, nama customer, atau nomor HP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="diterima">Diterima</SelectItem>
                <SelectItem value="diproses">Diproses</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Orders ({orders?.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Estimasi Selesai</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {order.customerDetails?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerDetails?.phone || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={getOrderStatusColor(order.order_status)}>
                      {getStatusLabel(order.order_status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getPaymentStatusColor(order.payment_status)}
                    >
                      {order.payment_status?.toUpperCase() || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.estimated_completion
                      ? formatDateTime(order.estimated_completion)
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order._id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(session?.user.role === "owner" ||
                        session?.user.role === "admin") && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrder(order._id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteOrder(order._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
