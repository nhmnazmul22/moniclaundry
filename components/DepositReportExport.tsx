"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/config/axios";
import { format } from "date-fns";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
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
  startDate: string;
  endDate: string;
  branchId: string;
}

export function DepositReportExport({
  branchId,
  startDate,
  endDate,
}: ExportFilters) {
  const [isExporting, setIsExporting] = useState(false);

  const fetchReportData = async (): Promise<DepositReportData[]> => {
    try {
      const params = new URLSearchParams();

      if (branchId) {
        params.append("branch_id", branchId);
      }

      if (startDate) {
        params.append("start_date", startDate);
      }

      if (endDate) {
        params.append("end_date", endDate);
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
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-6 w-6" />
          Laporan Deposit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            disabled={isExporting || !startDate || !endDate}
            className="flex-1"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Laporan
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
