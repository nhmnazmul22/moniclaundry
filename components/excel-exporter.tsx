"use client";

import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import { useState } from "react";

// Exact dummy data matching your complex image
const dummyTransactions = [
  {
    tanggalTransaksi: "31-05-2025 10:29",
    nomorTransaksi: "TRX4310/T1310",
    namaPelanggan: "Bu Lia",
    kategori: "Cuci dan Setrika",
    kilogramJenis: "CKS",
    kilogramTotal: "6.2",
    kilogramHarga: "Rp. 3,000",
    kategoriLayanan: "Sepatu Kulit/So, Sepatu Kulit/Sekolah/Premium",
    kategoriTotal: "1",
    kategoriHarga: "Rp. 60,000",
    kategoriMeter: "",
    meterLayanan: "",
    meterTotal: "",
    meterHarga: "",
    statusPembayaran: "Lunas",
    hargaPenjualan: "Rp. 55,800",
    metodePembayaran: "Transfer",
  },
  {
    tanggalTransaksi: "31-05-2025 10:22",
    nomorTransaksi: "TRX4310/T1309",
    namaPelanggan: "Bp Maydin",
    kategori: "",
    kilogramJenis: "",
    kilogramTotal: "",
    kilogramHarga: "",
    kategoriLayanan: "Celana Panjang, Celana Panjang, Kemeja",
    kategoriTotal: "3",
    kategoriHarga: "Rp. 20,000",
    kategoriMeter: "",
    meterLayanan: "",
    meterTotal: "",
    meterHarga: "",
    statusPembayaran: "Lunas",
    hargaPenjualan: "Rp. 60,000",
    metodePembayaran: "QRIS",
  },
  {
    tanggalTransaksi: "31-05-2025 10:21",
    nomorTransaksi: "TRX4310/T1308",
    namaPelanggan: "Bp Maydin",
    kategori: "",
    kilogramJenis: "",
    kilogramTotal: "",
    kilogramHarga: "",
    kategoriLayanan: "Kemeja",
    kategoriTotal: "4",
    kategoriHarga: "Rp. 20,000",
    kategoriMeter: "",
    meterLayanan: "",
    meterTotal: "",
    meterHarga: "",
    statusPembayaran: "Lunas",
    hargaPenjualan: "Rp. 140,000",
    metodePembayaran: "QRIS",
  },
  {
    tanggalTransaksi: "31-05-2025 10:50",
    nomorTransaksi: "TRX4310/T1307",
    namaPelanggan: "Nanda TG 3 no 3",
    kategori: "Cuci dan Setrika",
    kilogramJenis: "CKS",
    kilogramTotal: "5.0",
    kilogramHarga: "Rp. 3,000",
    kategoriLayanan: "",
    kategoriTotal: "",
    kategoriHarga: "",
    kategoriMeter: "",
    meterLayanan: "",
    meterTotal: "",
    meterHarga: "",
    statusPembayaran: "Lunas",
    hargaPenjualan: "Rp. 25,200",
    metodePembayaran: "QRIS",
  },
  {
    tanggalTransaksi: "31-05-2025 06:43",
    nomorTransaksi: "TRX4310/T1306",
    namaPelanggan: "Ibu Sari",
    kategori: "Cuci dan Setrika",
    kilogramJenis: "CKS",
    kilogramTotal: "3.5",
    kilogramHarga: "Rp. 3,000",
    kategoriLayanan: "",
    kategoriTotal: "",
    kategoriHarga: "",
    kategoriMeter: "",
    meterLayanan: "",
    meterTotal: "",
    meterHarga: "",
    statusPembayaran: "Lunas",
    hargaPenjualan: "Rp. 61,000",
    metodePembayaran: "QRIS",
  },
  {
    tanggalTransaksi: "31-05-2025 06:48",
    nomorTransaksi: "TRX4310/T1305",
    namaPelanggan: "Ibu Ningrum",
    kategori: "Cuci dan Setrika",
    kilogramJenis: "CKS",
    kilogramTotal: "3.7",
    kilogramHarga: "Rp. 3,000",
    kategoriLayanan: "",
    kategoriTotal: "",
    kategoriHarga: "",
    kategoriMeter: "",
    meterLayanan: "",
    meterTotal: "",
    meterHarga: "",
    statusPembayaran: "Lunas",
    hargaPenjualan: "Rp. 87,300",
    metodePembayaran: "Transfer",
  },
  {
    tanggalTransaksi: "31-05-2025 06:47",
    nomorTransaksi: "TRX4310/T1304",
    namaPelanggan: "Ibu Ningrum",
    kategori: "",
    kilogramJenis: "",
    kilogramTotal: "",
    kilogramHarga: "",
    kategoriLayanan: "Sepatu Kecil, Sepatu Kecil",
    kategoriTotal: "1",
    kategoriHarga: "Rp. 5,000",
    kategoriMeter: "",
    meterLayanan: "",
    meterTotal: "",
    meterHarga: "",
    statusPembayaran: "Lunas",
    hargaPenjualan: "Rp. 5,000",
    metodePembayaran: "Transfer",
  },
  {
    tanggalTransaksi: "31-05-2025 06:47",
    nomorTransaksi: "TRX4310/T1303",
    namaPelanggan: "Yoga",
    kategori: "",
    kilogramJenis: "",
    kilogramTotal: "",
    kilogramHarga: "",
    kategoriLayanan: "Celana Panjang, Celana Panjang",
    kategoriTotal: "3",
    kategoriHarga: "Rp. 20,000",
    kategoriMeter: "",
    meterLayanan: "",
    meterTotal: "",
    meterHarga: "",
    statusPembayaran: "Lunas",
    hargaPenjualan: "Rp. 54,000",
    metodePembayaran: "Cash",
  },
  {
    tanggalTransaksi: "31-05-2025 13:53",
    nomorTransaksi: "TRX4310/T1301",
    namaPelanggan: "Pillo Iront Andilla",
    kategori: "Cuci dan Setrika",
    kilogramJenis: "CKS",
    kilogramTotal: "8.2",
    kilogramHarga: "Rp. 3,000",
    kategoriLayanan: "",
    kategoriTotal: "",
    kategoriHarga: "",
    kategoriMeter: "",
    meterLayanan: "",
    meterTotal: "",
    meterHarga: "",
    statusPembayaran: "Lunas",
    hargaPenjualan: "Rp. 73,800",
    metodePembayaran: "Transfer",
  },
  {
    tanggalTransaksi: "31-05-2025 13:52",
    nomorTransaksi: "TRX4310/T1300",
    namaPelanggan: "Pillo Iront Andilla",
    kategori: "Cuci dan Setrika",
    kilogramJenis: "CKS",
    kilogramTotal: "5.4",
    kilogramHarga: "Rp. 3,000",
    kategoriLayanan: "",
    kategoriTotal: "",
    kategoriHarga: "",
    kategoriMeter: "",
    meterLayanan: "",
    meterTotal: "",
    meterHarga: "",
    statusPembayaran: "Lunas",
    hargaPenjualan: "Rp. 48,600",
    metodePembayaran: "Transfer",
  },
];

// Add summary section - Rows 7-11
const summaryData = [
  ["List Laporan Transaksi Layanan", ""],
  ["Total Kilos:", "2303.44 Kg"],
  ["Total Buah:", "530 Buah"],
  ["Jumlah Transaksi:", "533 Transaksi"],
  ["Total Pendapatan:", "Rp. 38,737,430"],
];

export default function Component() {
  const [isExporting, setIsExporting] = useState(false);

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
      worksheet.getCell("A2").value = "Mosaic Laundry GG";
      worksheet.getCell("A2").font = {
        bold: true,
        size: 11,
      };
      worksheet.getCell("A2").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet.mergeCells("A3:R3");
      worksheet.getCell("A3").value =
        "Jl. Grand Galaxy Boulevard Blok FE 2/7 Kavling B";
      worksheet.getCell("A3").font = { size: 11, bold: true };
      worksheet.getCell("A3").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      // Add report period - Row 5
      worksheet.mergeCells("A5:R5");
      worksheet.getCell("A5").value =
        "Laporan Transaksi Layanan dari tanggal 01-05-2025 sampai 31-05-2025";
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
      dummyTransactions.forEach((transaction, index) => {
        const rowIndex = 15 + index;

        const rowData = [
          transaction.tanggalTransaksi || "-",
          transaction.nomorTransaksi || "-",
          transaction.namaPelanggan || "-",
          transaction.kategori || "-",
          transaction.kilogramJenis || "-",
          transaction.kilogramTotal || "-",
          transaction.kilogramHarga || "-",
          transaction.kategoriLayanan || "-",
          transaction.kategoriLayanan || "-",
          transaction.kategoriTotal || "-",
          transaction.kategoriHarga || "-",
          transaction.kategoriMeter || "-",
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

  return (
    <Button
      onClick={exportToExcel}
      disabled={isExporting}
      className="w-full sm:w-auto"
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Export Report"}
    </Button>
  );
}
