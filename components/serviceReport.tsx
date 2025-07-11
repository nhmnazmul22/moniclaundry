"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/config/axios";
import { AppDispatch, RootState } from "@/store";
import { fetchBranches } from "@/store/BranchSlice";
import { Branches, SalesReportItem } from "@/types";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download, FileSpreadsheet } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ServiceReportType {
  branchId: string;
  startDate: string;
  endDate: string;
}

export default function ServiceReport({
  branchId,
  startDate,
  endDate,
}: ServiceReportType) {
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<SalesReportItem[]>([]);
  const [summaryData, setSummaryData] = useState<[string, string][]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branches | null>(null);
  const { items: branches } = useSelector(
    (state: RootState) => state.branchReducer
  );

  const dispatch = useDispatch<AppDispatch>();

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/reports/service-report?branch_id=${branchId}&start_date=${startDate}&end_date=${endDate}`
      );
      if (res.status === 200) {
        setReportData(res.data.data);
        setSummaryData(res.data.summary);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan Transaksi");

      // Set column widths to match your image exactly
      worksheet.columns = [
        { width: 15 }, // A - Tanggal Transaksi
        { width: 25 }, // B - Nomor Transaksi
        { width: 18 }, // C - Nama Pelanggan
        { width: 15 }, // D - Kategori
        { width: 10 }, // E - Kilogram
        { width: 8 }, // F - Total
        { width: 12 }, // G - Harga
        { width: 30 }, // H - Kategori Layanan
        { width: 15 }, // I - Layanan
        { width: 8 }, // J - Total
        { width: 12 }, // K - Harga
        { width: 12 }, // L - Kategori
        { width: 15 }, // M - Meter Layanan
        { width: 8 }, // N - Total
        { width: 12 }, // O - Harga
        { width: 18 }, // P - Status Pembayaran
        { width: 15 }, // Q - Harga Penjualan
        { width: 18 }, // R - Metode Pembayaran
      ];

      // Add header info (top right) - Row 1-3
      worksheet.mergeCells("A1:R1");
      worksheet.getCell("A1").value = "Laporan Transaksi Layanan";
      worksheet.getCell("A1").font = {
        bold: true,
        size: 11,
      };
      worksheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet.mergeCells("A2:R2");
      worksheet.getCell("A2").value = selectedBranch?.name || "";
      worksheet.getCell("A2").font = {
        bold: true,
        size: 11,
      };
      worksheet.getCell("A2").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet.mergeCells("A3:R3");
      worksheet.getCell("A3").value = selectedBranch?.address;
      worksheet.getCell("A3").font = { size: 11, bold: true };
      worksheet.getCell("A3").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      // Add report period - Row 5
      worksheet.mergeCells("A5:R5");
      worksheet.getCell(
        "A5"
      ).value = `Laporan Transaksi Layanan dari tanggal ${startDate} sampai ${endDate}`;
      worksheet.getCell("A5").font = { size: 11 };

      summaryData.forEach((row, index) => {
        const rowNum = 7 + index;
        worksheet.getCell(`A${rowNum}`).value = row[0];
        worksheet.getCell(`B${rowNum}`).value = row[1];

        // Style summary cells
        ["A", "B"].forEach((col) => {
          const cell = worksheet.getCell(`${col}${rowNum}`);
          cell.font = {
            size: 11,
          };
        });
      });

      // Add table headers - Row 13
      const headers = [
        { label: "Tanggal Transaksi", col: 1 },
        { label: "Nomor Transaksi", col: 2 },
        { label: "Nama Pelanggan", col: 3 },
      ];
      const lastheaders = [
        { label: "Status Pembayaran", col: 16 },
        { label: "Harga Penjualan", col: 17 },
        { label: "Metode Pembayaran", col: 18 },
      ];
      const subHeaders = ["Kategori", "Layanan", "Total", "Harga"];

      headers.forEach(({ label, col }) => {
        worksheet.mergeCells(13, col, 14, col);
        const cell = worksheet.getCell(13, col);
        cell.value = label;
        cell.font = { bold: true, size: 11, color: { argb: "000000" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFB4B4" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      });

      lastheaders.forEach(({ label, col }) => {
        worksheet.mergeCells(13, col, 14, col);
        const cell = worksheet.getCell(13, col);
        cell.value = label;
        cell.font = { bold: true, size: 11, color: { argb: "000000" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFB4B4" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      });

      // Merge D13:G13 and set as "Kil"
      worksheet.mergeCells("D13:G13");
      const kiloHeader = worksheet.getCell("D13");
      kiloHeader.value = "Kilogram";
      kiloHeader.font = { bold: true, size: 11 };
      kiloHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D3ECCD" },
      };
      kiloHeader.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      subHeaders.forEach((text, i) => {
        const col = 4 + i; // Starts from column D (index 4)
        const cell = worksheet.getCell(14, col);
        cell.value = text;
        cell.font = { bold: true, size: 11 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D3ECCD" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      });

      // Merge D13:G13 and set as "Satuan"
      worksheet.mergeCells("H13:K13");
      const satuanHeader = worksheet.getCell("H13");
      satuanHeader.value = "Satuan";
      satuanHeader.font = { bold: true, size: 11 };
      satuanHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD8D8" },
      };
      satuanHeader.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      subHeaders.forEach((text, i) => {
        const col = 8 + i; // Starts from column D (index 4)
        const cell = worksheet.getCell(14, col);
        cell.value = text;
        cell.font = { bold: true, size: 11 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD8D8" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      });

      // Merge D13:G13 and set as "Satuan"
      worksheet.mergeCells("L13:O13");
      const meterHeader = worksheet.getCell("L13");
      meterHeader.value = "Meter";
      meterHeader.font = { bold: true, size: 11 };
      meterHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "8DD8FF" },
      };
      meterHeader.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      subHeaders.forEach((text, i) => {
        const col = 12 + i;
        const cell = worksheet.getCell(14, col);
        cell.value = text;
        cell.font = { bold: true, size: 11 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "8DD8FF" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      });

      // Add transaction data with alternating colors
      reportData.forEach((transaction, index) => {
        const rowIndex = 15 + index;

        const rowData = [
          transaction.tanggalTransaksi || "-",
          transaction.nomorTransaksi || "-",
          transaction.namaPelanggan || "-",

          transaction.kilogramKategori || "-",
          transaction.kilogramJenis || "-",
          transaction.kilogramTotal || "-",
          transaction.kilogramHarga || "-",

          transaction.satuanKategori || "-",
          transaction.satuanLayanan || "-",
          transaction.satuanTotal || "-",
          transaction.satuanHarga || "-",

          transaction.meterKategori || "-",
          transaction.meterLayanan || "-",
          transaction.meterTotal || "-",
          transaction.meterHarga || "-",

          transaction.statusPembayaran || "-",
          transaction.hargaPenjualan || "-",
          transaction.metodePembayaran || "-",
        ];

        rowData.forEach((data, colIndex) => {
          const cell = worksheet.getCell(rowIndex, colIndex + 1);
          cell.value = data;
          cell.alignment = { vertical: "middle" };
          cell.font = { size: 11 };
        });
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Save file
      saveAs(
        blob,
        `Laporan_Transaksi_Colored_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [branchId, startDate, endDate]);

  useEffect(() => {
    dispatch(fetchBranches());
  }, []);

  useEffect(() => {
    if (branchId) {
      const branch = branches?.find((b) => b._id === branchId);
      setSelectedBranch(branch!);
    }
  }, [branchId, branches]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-6 w-6" />
          Laporan Transaksi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={exportToExcel}
          disabled={isExporting || loading}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Laporan"}
        </Button>
      </CardContent>
    </Card>
  );
}
