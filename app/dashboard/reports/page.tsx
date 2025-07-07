"use client";

import ChartData from "@/components/ChartData";
import CustomerReport from "@/components/customerReport";
import { DepositReportExport } from "@/components/DepositReportExport";
import { ExpenseExport } from "@/components/expense-export";
import ServiceTransitionReport from "@/components/serviceReport";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { createDummyData, exportSalesReport } from "@/lib/exportToExcel";
import { type ReportData } from "@/lib/pdf-generator";
import { ReportDataProcessor } from "@/lib/report-data-processor";
import { formatCurrency } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import { fetchCustomers } from "@/store/CustomerSlice";
import { fetchExpenses } from "@/store/ExpensesSlice";
import { fetchOrders } from "@/store/orderSlice";
import { fetchPayments } from "@/store/PaymentSlice";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarDays,
  Download,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ReportsPage() {
  const { currentBranchId } = useBranch();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [filterType, setFilterType] = useState<
    "daily" | "monthly" | "yearly" | "custom"
  >("monthly");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { items: ordersData } = useSelector(
    (state: RootState) => state.orderReducer
  );
  const { items: paymentsData } = useSelector(
    (state: RootState) => state.paymentsReducer
  );
  const { items: expensesData } = useSelector(
    (state: RootState) => state.expensesReducer
  );
  const { items: customerData } = useSelector(
    (state: RootState) => state.customerReducer
  );

  const generateReport = useCallback(async () => {
    const dateRange = {
      from: startDate,
      to: endDate,
    };
    if (!dateRange?.from || !dateRange?.to) {
      setError("Silakan pilih rentang tanggal.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Use the flexible processor that works with your actual data structure
      const processedData = ReportDataProcessor.processReportData(
        ordersData!,
        paymentsData!,
        expensesData!,
        customerData,
        dateRange
      );
      setReportData(processedData);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Terjadi kesalahan saat membuat laporan."
      );
      console.error(e);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [
    startDate,
    endDate,
    ordersData,
    paymentsData,
    customerData,
    expensesData,
    currentBranchId,
  ]);

  useEffect(() => {
    dispatch(fetchOrders(currentBranchId));
    dispatch(fetchPayments(currentBranchId));
    dispatch(fetchExpenses(currentBranchId));
    dispatch(fetchCustomers(currentBranchId));
  }, [currentBranchId]);

  useEffect(() => {
    generateReport();
  }, [generateReport, currentBranchId]);

  useEffect(() => {
    const today = new Date();
    if (filterType === "daily") {
      const dateStr = today.toISOString().split("T")[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (filterType === "monthly") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(lastDay.toISOString().split("T")[0]);
    } else if (filterType === "yearly") {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      const lastDay = new Date(today.getFullYear(), 11, 31);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(lastDay.toISOString().split("T")[0]);
    } else {
      setStartDate(startDate);
      setEndDate(endDate);
    }
  }, [dispatch, currentBranchId, filterType, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Analisis performa bisnis dan laporan keuangan
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-2">Membuat laporan...</p>
        </div>
      )}

      {error && !loading && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="mr-2" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={generateReport} className="mt-4">
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && reportData && (
        <>
          <div className="grid grid-cols-12 gap-5">
            <Card className="col-span-12">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="h-5 w-5" />
                  <h3 className="font-semibold">Filter Berdasarkan Tanggal</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label>Jenis Filter</Label>
                    <Select
                      value={filterType}
                      onValueChange={(val) => setFilterType(val as any)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Harian</SelectItem>
                        <SelectItem value="monthly">Bulanan</SelectItem>
                        <SelectItem value="yearly">Tahunan</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start-date">Tanggal Mulai</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1"
                      disabled={filterType !== "custom"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">Tanggal Akhir</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1"
                      disabled={filterType !== "custom"}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Chart data show */}
          <ChartData branchId={currentBranchId} />
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-3">
              <ServiceTransitionReport
                branchId={currentBranchId}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <div className="col-span-2">
              <CustomerReport startDate={startDate} endDate={endDate} />
            </div>
            <div className="col-span-2">
              <ExpenseExport
                expenses={expensesData!}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <div className="col-span-2">
              <DepositReportExport
                branchId={currentBranchId}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <div className="col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileSpreadsheet className="h-6 w-6" />
                    Laporan Penjualan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        exportSalesReport(createDummyData(reportData!))
                      }
                      disabled={!reportData || loading}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Laporan</CardTitle>
              <CardDescription>
                Untuk periode{" "}
                {startDate ? format(startDate, "dd MMM yyyy") : ""} -{" "}
                {endDate ? format(endDate, "dd MMM yyyy") : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.totalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-2xl font-bold">{reportData.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.avgOrderValue)}
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Penjualan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Rupiah:</span>
                  <span className="font-semibold">
                    {formatCurrency(reportData.salesData.rupiah)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Jumlah Kilo:</span>
                  <span className="font-semibold">
                    {reportData.salesData.kilo.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Jumlah Satuan:</span>
                  <span className="font-semibold">
                    {reportData.salesData.satuan} pcs
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cara Bayar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cash:</span>
                  <span>
                    {formatCurrency(reportData.paymentBreakdown.cash.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Transfer:</span>
                  <span>
                    {formatCurrency(
                      reportData.paymentBreakdown.transfer.amount
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>QRIS:</span>
                  <span>
                    {formatCurrency(reportData.paymentBreakdown.qris.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Deposit:</span>
                  <span>
                    {formatCurrency(reportData.paymentBreakdown.deposit.amount)}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-sm">
                  <span>Pengeluaran:</span>
                  <span className="text-red-600">
                    {formatCurrency(reportData.expenses)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Nett Cash:</span>
                  <span>{formatCurrency(reportData.netCash)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.dailyBreakdown.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Tidak ada data untuk ditampilkan pada rentang tanggal ini.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">
                        Avg per Order
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.dailyBreakdown.map((item) => (
                      <TableRow key={item.date}>
                        <TableCell>
                          {format(new Date(item.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.orders}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.avgPerOrder)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
      {!loading && !error && !reportData && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Silakan konfigurasikan dan buat laporan untuk melihat data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
