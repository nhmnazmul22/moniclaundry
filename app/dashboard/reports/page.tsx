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
import { getOrders, getPayments } from "@/lib/data";
import { generateLaundryReport, type ReportData } from "@/lib/pdf-generator";
import { ReportDataProcessor } from "@/lib/report-data-processor";
import { formatCurrency } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { AlertTriangle, Download, FileText, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

export default function ReportsPage() {
  const { currentBranchId } = useBranch();

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<string>("revenue_summary");

  const generateReport = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError("Silakan pilih rentang tanggal.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [ordersData, paymentsData] = await Promise.all([
        getOrders(currentBranchId),
        getPayments(),
      ]);

      if (!ordersData || !paymentsData) {
        throw new Error("Gagal mengambil data untuk laporan.");
      }

      // Use the flexible processor that works with your actual data structure
      const processedData = ReportDataProcessor.createMockDataFromActual(
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
      console.log("Starting PDF generation with data:", reportData);

      // Check if required dependencies are available
      if (typeof window === "undefined") {
        throw new Error("PDF generation must run in browser environment");
      }

      // Use the separated PDF generator with better error handling
      await generateLaundryReport(reportData, dateRange);

      console.log("PDF generated successfully");
    } catch (error) {
      console.error("Detailed PDF generation error:", error);

      // More specific error messages
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

  const handleExportCSV = () => {
    if (!reportData || reportData.dailyBreakdown.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const headers = ["Date", "Revenue", "Orders", "Avg Per Order"];
    const csvRows = [
      headers.join(","),
      ...reportData.dailyBreakdown.map((row) =>
        [row.date, row.revenue, row.orders, row.avgPerOrder.toFixed(2)].join(
          ","
        )
      ),
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `report_${reportType}_${format(
          dateRange?.from || new Date(),
          "yyyyMMdd"
        )}-${format(dateRange?.to || new Date(), "yyyyMMdd")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
            onClick={handleGeneratePDF}
            disabled={!reportData || loading || generatingPDF}
          >
            {generatingPDF ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Generate PDF
          </Button>
          <Button
            onClick={handleExportCSV}
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
