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
import { getOrders, getPayments } from "@/lib/data";
import {
  generateEnhancedLaundryReport,
  type EnhancedReportData,
} from "@/lib/pdf-generator-enhanced";
import { EnhancedReportProcessor } from "@/lib/report-data-enhanced";
import { formatCurrency } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { id } from "date-fns/locale";
import {
  AlertTriangle,
  Calculator,
  CreditCard,
  FileText,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

export default function EnhancedReportsPage() {
  const [reportData, setReportData] = useState<EnhancedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

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

  const handleGeneratePDF = async () => {
    if (!reportData) {
      alert("Tidak ada data untuk dibuat PDF.");
      return;
    }

    setGeneratingPDF(true);

    try {
      console.log("Starting enhanced PDF generation with data:", reportData);
      await generateEnhancedLaundryReport(reportData);
      console.log("Enhanced PDF generated successfully");
    } catch (error) {
      console.error("Detailed PDF generation error:", error);
      let errorMessage = "Terjadi kesalahan saat membuat PDF";

      if (error instanceof Error) {
        if (error.message.includes("jsPDF")) {
          errorMessage =
            "Error dengan library PDF. Pastikan jsPDF terinstall dengan benar.";
        } else if (error.message.includes("autoTable")) {
          errorMessage =
            "Error dengan tabel PDF. Pastikan jspdf-autotable terinstall dengan benar.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }

      alert(errorMessage);
    } finally {
      setGeneratingPDF(false);
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
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGeneratePDF}
            disabled={!reportData || loading || generatingPDF}
          >
            {generatingPDF ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Generate PDF Laporan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Laporan</CardTitle>
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
                  {reportData.serviceCategories.items.map(
                    (item: any, index: number) => (
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
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deposit Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Deposit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Top Up Deposit:</span>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(
                          reportData.depositDetails.topUpDeposit.nominal
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reportData.depositDetails.topUpDeposit.transactions}{" "}
                        transaksi
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Transaksi Deposit:</span>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(
                          reportData.depositDetails.transactionDeposit.nominal
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {
                          reportData.depositDetails.transactionDeposit
                            .transactions
                        }{" "}
                        transaksi
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <div className="text-red-600 font-medium">Formula:</div>
                    <div>
                      • Top Up Deposit: Customer yang melakukan pembeli deposit
                    </div>
                    <div>
                      • Transaksi Deposit: Customer yang melakukan laundry pakai
                      deposit
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Period Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Periode</CardTitle>
              <CardDescription>
                Periode:{" "}
                {format(reportData.dateRange.from, "dd MMMM yyyy", {
                  locale: id,
                })}{" "}
                -{" "}
                {format(reportData.dateRange.to, "dd MMMM yyyy", {
                  locale: id,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(reportData.salesData.rupiah)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Penjualan
                  </div>
                </div>

                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.salesData.kilo.toFixed(1)} kg
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Berat
                  </div>
                </div>

                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {reportData.salesData.satuan}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Satuan
                  </div>
                </div>
              </div>
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
