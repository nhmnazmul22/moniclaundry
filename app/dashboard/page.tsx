"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBranch } from "@/contexts/branch-context";
import { getDashboardStats } from "@/lib/data";
import { formatCurrency } from "@/lib/utils"; // Ensure formatDateTime is imported if used for recentOrders
import type {
  DashboardStats,
  InventoryItem,
  Order as RecentOrderType,
} from "@/types/database"; // Use existing types
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Eye,
  Loader2,
  Plus,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { currentBranchId } = useBranch();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats(currentBranchId);
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
      setStats(null); // Clear stats on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, [currentBranchId]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 17) return "Selamat Siang";
    return "Selamat Malam";
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      received: "Diterima",
      washing: "Dicuci",
      drying: "Dikeringkan",
      ironing: "Disetrika",
      ready: "Siap Diambil",
      out_for_delivery: "Diantar",
      delivered: "Selesai",
      cancelled: "Dibatalkan",
    };
    return (
      labels[status] || status?.charAt(0)?.toUpperCase() + status?.slice(1)
    );
  };

  const getOrderStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      received: "bg-blue-100 text-blue-800",
      washing: "bg-yellow-100 text-yellow-800",
      drying: "bg-orange-100 text-orange-800",
      ironing: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
      delivered: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Monic Laundry POS
          </h2>
          <p className="text-muted-foreground">Dashboard</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            🟢 LIVE MODE
          </Badge>
          <Link href="/dashboard/orders/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Order Baru
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader className="flex flex-row items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-700">
              Error Memuat Data Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-3"
              variant="outline"
            >
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && !stats && !loading && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Tidak ada data statistik untuk ditampilkan saat ini.
            </p>
          </CardContent>
        </Card>
      )}

      {stats && (
        <>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                {getGreeting()}!
              </h3>
              <p className="text-muted-foreground">
                Berikut adalah ringkasan bisnis Monic Laundry hari ini.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hari ini: {formatCurrency(stats.todayRevenue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Orders
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Hari ini: {stats.todayOrders} orders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Orders
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.pendingOrders}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Perlu diproses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalCustomers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pelanggan terdaftar
                  </p>
                </CardContent>
              </Card>
            </div>

            {stats.lowStockItems && stats.lowStockItems.length > 0 && (
              <Card className="border-orange-300 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Peringatan Stok Rendah
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.lowStockItems.map((item: InventoryItem) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-orange-700">
                          {item.item_name} - Sisa: {item.max_stock} {item.unit}{" "}
                          (Min: {item.min_stock})
                        </span>
                        <Link
                          href={`/dashboard/inventory?edit=${item.id}&action=restock`}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-300 text-orange-700 hover:bg-orange-100"
                          >
                            Restock
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-full lg:col-span-4">
                <CardHeader>
                  <CardTitle>Order Terbaru</CardTitle>
                  <div className="flex items-center justify-between">
                    <CardDescription>
                      Daftar 5 pesanan terbaru yang masuk
                    </CardDescription>
                    <Link href="/dashboard/orders">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Semua
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentOrders && stats.recentOrders.length > 0 ? (
                      stats.recentOrders.map((order: RecentOrderType) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {order.order_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.customer?.name || "Customer N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(order.total_amount || 0)}
                            </p>
                            <Badge
                              className={`${getOrderStatusColor(
                                order.order_status
                              )} text-xs`}
                            >
                              {getOrderStatusLabel(order.order_status) || ""}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Belum ada pesanan terbaru
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-full lg:col-span-3">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Aksi cepat untuk operasional harian
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/dashboard/orders/new" className="block">
                    <Button className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Buat Order Baru
                    </Button>
                  </Link>
                  <Link href="/dashboard/customers/new" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Customer Baru
                    </Button>
                  </Link>
                  <Link href="/dashboard/services" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Kelola Layanan
                    </Button>
                  </Link>
                  <Link href="/dashboard/reports" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Lihat Laporan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  🎉 DASHBOARD BERHASIL DIMUAT!
                </p>
                <p className="text-sm text-green-700">
                  Semua data ditampilkan secara live dari database Supabase
                  Anda.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
