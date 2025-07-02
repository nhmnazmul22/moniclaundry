"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranch } from "@/contexts/branch-context";
import { DashboardSummaryData } from "@/types";
import { addDays } from "date-fns";
import {
  AlertTriangle,
  CreditCard,
  Loader2,
  Shirt,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export default function DashboardPage() {
  const { currentBranchId } = useBranch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummaryData>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const formatDate = (date: Date) => date.toISOString().split("T")[0]; // 'YYYY-MM-DD'

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      if (currentBranchId) {
        const res = await fetch(
          `/api/reports/dashboard/?branch_id=${currentBranchId}&start_date=${formatDate(
            dateRange?.from!
          )}&end_date=${formatDate(dateRange?.to!)}`
        );
        const json = await res.json();
        setDashboardData(json);
      }
    } catch (err: any) {
      console.error("Error fetching dashboard summary", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentBranchId) {
      fetchDashboardSummary();
    }
  }, [currentBranchId, dateRange]);

  const salesData = {
    totalRevenue: dashboardData && dashboardData?.salesData.totalRevenue,
    paidAmount: dashboardData && dashboardData?.salesData.paidAmount,
    outstandingAmount:
      dashboardData && dashboardData?.salesData.outstandingAmount,
    expenses: dashboardData && dashboardData?.salesData.expenses,
    netCash: dashboardData && dashboardData?.salesData.netCash,
  };

  const laundryData = {
    totalKg: dashboardData && dashboardData?.laundryData.totalKg,
    totalUnits: dashboardData && dashboardData?.laundryData.totalUnits,
  };

  const transactionData = {
    totalTransactions:
      dashboardData && dashboardData?.transactionData.totalTransactions,
    paymentMethods:
      dashboardData && dashboardData?.transactionData.paymentMethods,
    regularTransactions:
      dashboardData && dashboardData?.transactionData.regularTransactions,
    cancelledTransactions:
      dashboardData && dashboardData?.transactionData.cancelledTransactions,
  };

  const depositData = {
    topUpCount: dashboardData && dashboardData?.depositData.topUpCount,
    topUpUsers: dashboardData && dashboardData?.depositData.topUpUsers,
    totalTopUpValue:
      dashboardData && dashboardData?.depositData.totalTopUpValue,
  };

  const customerData = {
    existingCustomers:
      dashboardData && dashboardData?.customerData.existingCustomers,
    newCustomers: dashboardData && dashboardData?.customerData.newCustomers,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Data Penjualan 1 Outlet
          </h1>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="grid gap-2">
              <Label>Rentang Tanggal</Label>
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
                className="w-full md:w-auto"
              />
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Rupiah
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(salesData.totalRevenue!)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status Lunas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(salesData.paidAmount!)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status Piutang
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(salesData.outstandingAmount!)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(salesData.expenses!)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-1 space-y-0 pb-2">
            <Wallet className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-medium">Net Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(salesData.netCash!)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Transaksi Cash {formatCurrency(salesData.totalRevenue!)} -
              Pengeluaran {formatCurrency(salesData.expenses!)}
            </p>
          </CardContent>
        </Card>

        {/* Laundry Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Jenis Laundry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Jumlah Kilo</span>
                <Badge variant="secondary">{laundryData.totalKg} kg</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Jumlah Satuan</span>
                <Badge variant="secondary">{laundryData.totalUnits} buah</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ringkasan Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Transaksi</span>
                <Badge variant="default">
                  {transactionData.totalTransactions} transaksi
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transaksi Reguler</span>
                <Badge variant="secondary">
                  {transactionData.regularTransactions}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Transaksi Dibatalkan
                </span>
                <Badge variant="destructive">
                  {transactionData.cancelledTransactions}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Jenis Transaksi & Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenis Pembayaran</TableHead>
                  <TableHead className="text-center">
                    Jumlah Transaksi
                  </TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionData?.paymentMethods?.map((method, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{method.type}</TableCell>
                    <TableCell className="text-center">
                      {method.count}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(method.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Deposit & Customer Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Deposit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Jumlah Top Up Deposit
                </span>
                <Badge variant="secondary">{depositData.topUpCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Pengguna yang Melakukan Deposit
                </span>
                <Badge variant="secondary">{depositData.topUpUsers}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Nilai Nominal</span>
                <span className="text-lg font-bold">
                  {formatCurrency(depositData.totalTopUpValue!)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Status Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Customer Lama</span>
                <Badge variant="secondary">
                  {customerData.existingCustomers} transaksi
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Dilihat dari data customer yang sudah terdaftar
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Customer Baru</span>
                <Badge variant="default">
                  {customerData.newCustomers} transaksi
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Dilihat dari data customer yang baru terdaftar
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
