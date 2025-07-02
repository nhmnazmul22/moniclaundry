"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/lib/config/axios";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DepositReportData {
  no: number;
  nama: string;
  cif: string;
  tanggal_top_up_deposit: string;
  tanggal_transaksi: string;
  nilai_transaksi: number;
  total_top_up: number;
  total_penggunaan_deposit: number;
  saldo_akhir: number;
}

interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  branchId: string;
}

export function DepositReportExport({ branchId }: { branchId: string }) {
  const [filters, setFilters] = useState<ExportFilters>({
    branchId,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Default to start of current month
    endDate: new Date(), // Default to today
  });
  const [isExporting, setIsExporting] = useState(false);

  const fetchReportData = async (): Promise<DepositReportData[]> => {
    try {
      const params = new URLSearchParams();

      if (branchId) {
        params.append("branch_id", branchId);
      }

      if (filters.startDate) {
        params.append(
          "start_date",
          filters.startDate.toISOString().split("T")[0]
        );
      }

      if (filters.endDate) {
        params.append("end_date", filters.endDate.toISOString().split("T")[0]);
      }

      const response = await api.get(
        `/api/reports/deposit?${params.toString()}`
      );

      if (
        response.data.status === "Successful" &&
        response.data.data.deposit_report_data
      ) {
        return response.data.data.deposit_report_data;
      } else {
        throw new Error("No deposit report data found");
      }
    } catch (error: any) {
      console.error("Error fetching report data:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Failed to fetch data"
      );
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const data = await fetchReportData();
      console.log(data);
      // Create CSV content
      const headers = [
        "No",
        "Nama",
        "CIF",
        "Tanggal Top Up Deposit",
        "Tanggal Transaksi",
        "Nilai Transaksi",
        "Total Top Up",
        "Total Penggunaan Deposit",
        "Saldo Akhir",
      ];

      const csvContent = [
        headers.join(","),
        ...data.map((item) =>
          [
            item.no,
            `"${item.nama}"`,
            `"${item.cif}"`,
            `"${item.tanggal_top_up_deposit}"`,
            `"${item.tanggal_transaksi}"`,
            item.nilai_transaksi,
            item.total_top_up,
            item.total_penggunaan_deposit,
            item.saldo_akhir,
          ].join(",")
        ),
      ].join("\n");

      // Generate filename
      const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
      const filename = `Laporan_Deposit_${timestamp}.csv`;

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Laporan CSV berhasil diekspor: ${filename}`);
    } catch (error) {
      console.error("CSV Export error:", error);
      toast.error("Gagal mengekspor laporan CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const data = await fetchReportData();

      // For Excel export, you would typically use a library like ExcelJS
      // For now, we'll create a simple tab-separated values file that Excel can open
      const headers = [
        "No",
        "Nama",
        "CIF",
        "Tanggal Top Up Deposit",
        "Tanggal Transaksi",
        "Nilai Transaksi",
        "Total Top Up",
        "Total Penggunaan Deposit",
        "Saldo Akhir",
      ];

      const excelContent = [
        headers.join("\t"),
        ...data.map((item) =>
          [
            item.no,
            item.nama,
            item.cif,
            item.tanggal_top_up_deposit,
            item.tanggal_transaksi,
            item.nilai_transaksi,
            item.total_top_up,
            item.total_penggunaan_deposit,
            item.saldo_akhir,
          ].join("\t")
        ),
      ].join("\n");

      // Generate filename
      const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
      const filename = `Laporan_Deposit_${timestamp}.xls`;

      // Create and download file
      const blob = new Blob([excelContent], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Laporan Excel berhasil diekspor: ${filename}`);
    } catch (error) {
      console.error("Excel Export error:", error);
      toast.error("Gagal mengekspor laporan Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Laporan Deposit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate
                    ? format(filters.startDate, "dd/MM/yyyy")
                    : "Pilih tanggal mulai"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) =>
                    setFilters({ ...filters, startDate: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Tanggal Akhir</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate
                    ? format(filters.endDate, "dd/MM/yyyy")
                    : "Pilih tanggal akhir"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => setFilters({ ...filters, endDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            disabled={isExporting || !filters.startDate || !filters.endDate}
            className="flex-1"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengekspor...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={isExporting || !filters.startDate || !filters.endDate}
            className="flex-1 bg-transparent"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengekspor...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Periode yang dipilih:</strong>{" "}
            {filters.startDate && filters.endDate
              ? `${format(filters.startDate, "dd/MM/yyyy")} - ${format(
                  filters.endDate,
                  "dd/MM/yyyy"
                )}`
              : "Pilih tanggal mulai dan akhir"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
