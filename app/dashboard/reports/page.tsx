"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
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
import { fetchOrders } from "@/store/orderSlice";
import { fetchPayments } from "@/store/PaymentSlice";
import { addDays, format } from "date-fns";
import { AlertTriangle, Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDispatch, useSelector } from "react-redux";

export default function ReportsPage() {
  const { currentBranchId } = useBranch();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<string>("revenue_summary");

  const { items: ordersData } = useSelector(
    (state: RootState) => state.orderReducer
  );
  const { items: paymentsData } = useSelector(
    (state: RootState) => state.paymentsReducer
  );

  const generateReport = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError("Silakan pilih rentang tanggal.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Use the flexible processor that works with your actual data structure
      const processedData = ReportDataProcessor.createMockDataFromActual(
        ordersData!,
        paymentsData!,
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
  }, [dateRange, reportType, ordersData, paymentsData, currentBranchId]);

  useEffect(() => {
    dispatch(fetchOrders(currentBranchId));
    dispatch(fetchPayments(currentBranchId));
  }, [currentBranchId]);

  useEffect(() => {
    generateReport();
  }, [generateReport, currentBranchId]);

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
        <div className="flex gap-2">
          <Button
            onClick={() => exportSalesReport(createDummyData(reportData!))}
            disabled={!reportData || loading}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="grid gap-2">
            <Label htmlFor="reportType">Tipe Laporan</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Pilih Tipe Laporan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue_summary">
                  Ringkasan Pendapatan
                </SelectItem>
                <SelectItem value="order_details" disabled>
                  Detail Pesanan (Segera Hadir)
                </SelectItem>
                <SelectItem value="customer_insights" disabled>
                  Wawasan Pelanggan (Segera Hadir)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Rentang Tanggal</Label>
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
              className="w-full md:w-auto"
            />
          </div>
          <Button
            onClick={generateReport}
            disabled={loading}
            className="self-end"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Report
          </Button>
        </CardContent>
      </Card>

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
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Laporan</CardTitle>
              <CardDescription>
                Untuk periode{" "}
                {dateRange?.from ? format(dateRange.from, "dd MMM yyyy") : ""} -{" "}
                {dateRange?.to ? format(dateRange.to, "dd MMM yyyy") : ""}
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
