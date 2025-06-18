"use client"

import { Label } from "@/components/ui/label"

import { useEffect, useState, useCallback } from "react"
import { formatCurrency } from "@/lib/utils"
import { getOrders, getPayments } from "@/lib/data" // Assuming these fetch necessary data
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker" // Assuming this component exists
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, AlertTriangle, Download } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"

interface ReportData {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  growthRate?: number // Optional, if comparison period is available
  dailyBreakdown: Array<{ date: string; revenue: number; orders: number; avgPerOrder: number }>
  topServices?: Array<{ name: string; count: number; revenue: number }> // Example
  paymentMethods?: { [key: string]: number } // Example
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [reportType, setReportType] = useState<string>("revenue_summary") // e.g., revenue_summary, order_details, customer_insights

  const generateReport = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError("Silakan pilih rentang tanggal.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Fetch raw data - adjust based on actual needs for different report types
      const [ordersData, paymentsData] = await Promise.all([
        getOrders(), // Potentially filter by dateRange on backend if possible
        getPayments(), // Potentially filter by dateRange on backend
      ])

      if (!ordersData || !paymentsData) {
        throw new Error("Gagal mengambil data untuk laporan.")
      }

      // Filter data by dateRange client-side if not done on backend
      const filteredOrders = ordersData.filter((o) => {
        const orderDate = new Date(o.created_at)
        return orderDate >= dateRange.from! && orderDate <= dateRange.to!
      })
      const filteredPayments = paymentsData.filter((p) => {
        const paymentDate = new Date(p.payment_date)
        return p.status === "completed" && paymentDate >= dateRange.from! && paymentDate <= dateRange.to!
      })

      // Process data based on reportType
      let processedData: ReportData

      if (reportType === "revenue_summary") {
        const totalRevenue = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
        const totalOrders = filteredOrders.length
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        const dailyBreakdownMap: { [key: string]: { revenue: number; orders: number } } = {}

        filteredPayments.forEach((p) => {
          const dateStr = format(new Date(p.payment_date), "yyyy-MM-dd")
          if (!dailyBreakdownMap[dateStr]) dailyBreakdownMap[dateStr] = { revenue: 0, orders: 0 }
          dailyBreakdownMap[dateStr].revenue += p.amount || 0
        })
        filteredOrders.forEach((o) => {
          const dateStr = format(new Date(o.created_at), "yyyy-MM-dd")
          if (!dailyBreakdownMap[dateStr]) dailyBreakdownMap[dateStr] = { revenue: 0, orders: 0 } // Ensure date exists
          dailyBreakdownMap[dateStr].orders++
        })

        const dailyBreakdown = Object.entries(dailyBreakdownMap)
          .map(([date, data]) => ({
            date,
            ...data,
            avgPerOrder: data.orders > 0 ? data.revenue / data.orders : 0,
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        processedData = { totalRevenue, totalOrders, avgOrderValue, dailyBreakdown }
      } else {
        // Placeholder for other report types
        processedData = { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, dailyBreakdown: [] }
      }

      setReportData(processedData)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat membuat laporan.")
      console.error(e)
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }, [dateRange, reportType])

  useEffect(() => {
    generateReport()
  }, [generateReport]) // Auto-generate on initial load or when params change

  const handleExport = () => {
    // Basic CSV export example
    if (!reportData || reportData.dailyBreakdown.length === 0) {
      alert("Tidak ada data untuk diekspor.")
      return
    }
    const headers = ["Date", "Revenue", "Orders", "Avg Per Order"]
    const csvRows = [
      headers.join(","),
      ...reportData.dailyBreakdown.map((row) =>
        [row.date, row.revenue, row.orders, row.avgPerOrder.toFixed(2)].join(","),
      ),
    ]
    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `report_${reportType}_${format(dateRange?.from || new Date(), "yyyyMMdd")}-${format(dateRange?.to || new Date(), "yyyyMMdd")}.csv`,
      )
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Analisis performa bisnis dan laporan keuangan</p>
        </div>
        <Button onClick={handleExport} disabled={!reportData || loading}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
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
                <SelectItem value="revenue_summary">Ringkasan Pendapatan</SelectItem>
                {/* Add more report types here */}
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
            <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full md:w-auto" />
          </div>
          <Button onClick={generateReport} disabled={loading} className="self-end">
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
                Untuk periode {dateRange?.from ? format(dateRange.from, "dd MMM yyyy") : ""} -{" "}
                {dateRange?.to ? format(dateRange.to, "dd MMM yyyy") : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{reportData.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.avgOrderValue)}</p>
              </div>
            </CardContent>
          </Card>

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
                      <TableHead className="text-right">Avg per Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.dailyBreakdown.map((item) => (
                      <TableRow key={item.date}>
                        <TableCell>{format(new Date(item.date), "dd MMM yyyy")}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                        <TableCell className="text-right">{item.orders}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.avgPerOrder)}</TableCell>
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
            <p className="text-muted-foreground">Silakan konfigurasikan dan buat laporan untuk melihat data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
