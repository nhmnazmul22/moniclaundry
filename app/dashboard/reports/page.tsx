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
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  downloadCSV,
  generateDetailedServiceCSV,
  generateProfessionalCSV,
} from "@/lib/csv-generator";
import { getOrders, getPayments } from "@/lib/data";
import {
  downloadExcel,
  generateProfessionalExcel,
} from "@/lib/excel-generator";
import type { EnhancedReportData } from "@/lib/report-data-enhanced";
import { EnhancedReportProcessor } from "@/lib/report-data-enhanced";
import { formatCurrency } from "@/lib/utils";
import { addDays, format } from "date-fns";
import {
  AlertTriangle,
  Calculator,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

export default function ReportsPage() {
  const [reportData, setReportData] = useState<EnhancedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<string>("enhanced_summary");

  const generateReport = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError("Silakan pilih rentang tanggal.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [ordersData, paymentsData] = await Promise.all([
        getOrders(),
        getPayments(),
      ]);

      if (!ordersData || !paymentsData) {
        throw new Error("Gagal mengambil data untuk laporan.");
      }

      const processedData = EnhancedReportProcessor.createEnhancedReport(
        ordersData,
        paymentsData,
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
  }, [dateRange, reportType]);

  const handleExportProfessionalCSV = async () => {
    if (!reportData) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    setExporting(true);
    try {
      const csvContent = generateProfessionalCSV(reportData);
      const filename = `Laporan_Laundry_Professional_${format(
        dateRange?.from || new Date(),
        "yyyyMMdd"
      )}-${format(dateRange?.to || new Date(), "yyyyMMdd")}.csv`;
      downloadCSV(csvContent, filename);
      console.log("Professional CSV exported successfully");
    } catch (error) {
      console.error("CSV export error:", error);
      alert("Terjadi kesalahan saat mengekspor CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleExportDetailedServiceCSV = async () => {
    if (!reportData) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    setExporting(true);
    try {
      const csvContent = generateDetailedServiceCSV(reportData);
      const filename = `Laporan_Laundry_DetailService_${format(
        dateRange?.from || new Date(),
        "yyyyMMdd"
      )}-${format(dateRange?.to || new Date(), "yyyyMMdd")}.csv`;
      downloadCSV(csvContent, filename);
      console.log("Detailed service CSV exported successfully");
    } catch (error) {
      console.error("CSV export error:", error);
      alert("Terjadi kesalahan saat mengekspor CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!reportData) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    setExporting(true);
    try {
      const workbook = generateProfessionalExcel(reportData);
      const filename = `Laporan_Laundry_Excel_${format(
        dateRange?.from || new Date(),
        "yyyyMMdd"
      )}-${format(dateRange?.to || new Date(), "yyyyMMdd")}.xlsx`;
      downloadExcel(workbook, filename);
      console.log("Excel exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      alert("Terjadi kesalahan saat mengekspor Excel");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Laporan Jual Cuci Laundry
          </h1>
          <p className="text-muted-foreground">
            Laporan lengkap penjualan, pembayaran, dan analisis bisnis laundry
            dalam format profesional
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleExportExcel}
            disabled={!reportData || loading || exporting}
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Export Excel (Recommended)
          </Button>
          <Button
            onClick={handleExportProfessionalCSV}
            disabled={!reportData || loading || exporting}
            variant="outline"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export CSV Professional
          </Button>
          <Button
            onClick={handleExportDetailedServiceCSV}
            disabled={!reportData || loading || exporting}
            variant="secondary"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export CSV Detail
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Laporan</CardTitle>
          <CardDescription>
            Pilih format export sesuai kebutuhan. Excel format memberikan
            tampilan terbaik dengan formatting lengkap.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="grid gap-2">
            <Label htmlFor="reportType">Tipe Laporan</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Pilih Tipe Laporan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enhanced_summary">
                  Laporan Lengkap Laundry
                </SelectItem>
                <SelectItem value="daily_breakdown">
                  Breakdown Harian
                </SelectItem>
                <SelectItem value="payment_analysis">
                  Analisis Pembayaran
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
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Penjualan
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData.salesData.rupiah)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.salesData.kilo.toFixed(1)} kg •{" "}
                  {reportData.salesData.satuan} pcs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Cash</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData.netCash)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cash - Pengeluaran
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transaksi
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.transactionCount.kilo +
                    reportData.transactionCount.satuan}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.transactionCount.kilo} kilo •{" "}
                  {reportData.transactionCount.satuan} satuan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.customerTransactions.new +
                    reportData.customerTransactions.old}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.customerTransactions.new} baru •{" "}
                  {reportData.customerTransactions.old} lama
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Cara Bayar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Cash</Badge>
                      <span className="text-sm text-muted-foreground">
                        {reportData.paymentMethods.cash.transactions} transaksi
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(reportData.paymentMethods.cash.nominal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Transfer</Badge>
                      <span className="text-sm text-muted-foreground">
                        {reportData.paymentMethods.transfer.transactions}{" "}
                        transaksi
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(
                        reportData.paymentMethods.transfer.nominal
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">QRIS</Badge>
                      <span className="text-sm text-muted-foreground">
                        {reportData.paymentMethods.qris.transactions} transaksi
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(reportData.paymentMethods.qris.nominal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Deposit</Badge>
                      <span className="text-sm text-muted-foreground">
                        {reportData.paymentMethods.deposit.transactions}{" "}
                        transaksi
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(
                        reportData.paymentMethods.deposit.nominal
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600">Pengeluaran:</span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(reportData.pengeluaran)}
                  </span>
                </div>

                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Net Cash:</span>
                  <span
                    className={
                      reportData.netCash >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formatCurrency(reportData.netCash)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kategori Layanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Regular</div>
                      <div className="text-sm text-muted-foreground">
                        {reportData.serviceCategories.regular.kilo.toFixed(1)}{" "}
                        kg ×{" "}
                        {formatCurrency(
                          reportData.serviceCategories.regular.price
                        )}
                      </div>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(
                        reportData.serviceCategories.regular.total
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Express</div>
                      <div className="text-sm text-muted-foreground">
                        {reportData.serviceCategories.express.kilo.toFixed(1)}{" "}
                        kg ×{" "}
                        {formatCurrency(
                          reportData.serviceCategories.express.price
                        )}
                      </div>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(
                        reportData.serviceCategories.express.total
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Detail Items:</h4>
                  {reportData.serviceCategories.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
