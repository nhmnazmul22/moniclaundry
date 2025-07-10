"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/config/axios";
import { SalesReportData } from "@/types";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download, FileSpreadsheet } from "lucide-react";
import { useEffect, useState } from "react";

interface SalesReportType {
  branchId: string;
  startDate: string;
  endDate: string;
}

export default function SalesReport({
  branchId,
  startDate,
  endDate,
}: SalesReportType) {
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<SalesReportData>();

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/reports/sales-report?branch_id=${branchId}&start_date=${startDate}&end_date=${endDate}`
      );
      if (res.status === 200) {
        setReportData(res.data.data);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = async () => {
    setIsExporting(true);

    try {
      if (reportData) {
        const workbook = new ExcelJS.Workbook();

        const sheet1 = workbook.addWorksheet("Laporan Penjualan");
        const sheet2 = workbook.addWorksheet("Laporan Jenis Cucian");

        const cellBorderStyle: Partial<ExcelJS.Borders> = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // ----------- Sheet 1: Summary Report -----------
        sheet1.columns = Array(7).fill({ width: 20 });
        sheet1.getCell("B2").value = "Penjualan Hari Ini";
        sheet1.getCell("B2").font = { bold: true };

        // Sales Data
        let row = 3;
        const sales = reportData.salesData || {};
        sheet1.getCell(`B3`).value = "Rupiah";
        sheet1.getCell("B4").value = "Jumlah Kilo";
        sheet1.getCell("B5").value = "Jumlah Satuan";

        sheet1.getCell("C3").value = sales.rupiah || 0;
        sheet1.getCell("C4").value = sales.kilo || 0;
        sheet1.getCell("C5").value = sales.satuan || 0;

        sheet1.getCell("C3").border = cellBorderStyle;
        sheet1.getCell("C4").border = cellBorderStyle;
        sheet1.getCell("C5").border = cellBorderStyle;

        // Payment Methods data
        const paymentBreakdown = reportData.paymentBreakdown;
        sheet1.getCell(`B11`).value = "Cara Bayar";
        sheet1.getCell(`B12`).value = "Cash";
        sheet1.getCell(`B13`).value = "Transfer";
        sheet1.getCell(`B14`).value = "QRIS";
        sheet1.getCell(`B15`).value = "Deposit";

        sheet1.getCell(`C11`).value = "#Transaksi";
        sheet1.getCell(`C12`).value = paymentBreakdown.cash.transactions;
        sheet1.getCell(`C13`).value = paymentBreakdown.transfer.transactions;
        sheet1.getCell(`C14`).value = paymentBreakdown.qris.transactions;
        sheet1.getCell(`C15`).value = paymentBreakdown.deposit.transactions;

        sheet1.getCell(`D11`).value = "Nominal";
        sheet1.getCell(`D12`).value = paymentBreakdown.cash.amount;
        sheet1.getCell(`D13`).value = paymentBreakdown.transfer.amount;
        sheet1.getCell(`D14`).value = paymentBreakdown.qris.amount;
        sheet1.getCell(`D15`).value = paymentBreakdown.deposit.amount;

        // Styling
        sheet1.getCell("B11").font = { bold: true };
        sheet1.getCell("C11").font = { bold: true };
        sheet1.getCell("D11").font = { bold: true };
        sheet1.getCell("B12").border = cellBorderStyle;
        sheet1.getCell("B13").border = cellBorderStyle;
        sheet1.getCell("B14").border = cellBorderStyle;
        sheet1.getCell("B15").border = cellBorderStyle;
        sheet1.getCell("C11").border = cellBorderStyle;
        sheet1.getCell("C12").border = cellBorderStyle;
        sheet1.getCell("C13").border = cellBorderStyle;
        sheet1.getCell("C14").border = cellBorderStyle;
        sheet1.getCell("C15").border = cellBorderStyle;
        sheet1.getCell("D11").border = cellBorderStyle;
        sheet1.getCell("D12").border = cellBorderStyle;
        sheet1.getCell("D13").border = cellBorderStyle;
        sheet1.getCell("D14").border = cellBorderStyle;
        sheet1.getCell("D15").border = cellBorderStyle;

        // Piutang data
        sheet1.getCell("B18").value = "Piutang";
        sheet1.getCell("C17").value = "#Transaksi";
        sheet1.getCell("D17").value = "Nominal";

        sheet1.getCell("C18").value = 0;
        sheet1.getCell("D18").value = 0;

        sheet1.getCell("C17").font = { bold: true };
        sheet1.getCell("B18").font = { bold: true };
        sheet1.getCell("D17").font = { bold: true };
        sheet1.getCell("C17").border = cellBorderStyle;
        sheet1.getCell("D17").border = cellBorderStyle;
        sheet1.getCell("C18").border = cellBorderStyle;
        sheet1.getCell("D18").border = cellBorderStyle;

        //  Pengeluaran data
        const expenses = reportData.expenses;
        sheet1.getCell("B20").value = "Pengeluaran";
        sheet1.getCell("C20").value = expenses.transaction;
        sheet1.getCell("D20").value = expenses.total;

        sheet1.getCell("C20").border = cellBorderStyle;
        sheet1.getCell("D20").border = cellBorderStyle;

        // Net Cash data
        sheet1.getCell("B22").value = "Nett Cash";
        sheet1.getCell("D22").value = reportData.netCash;

        sheet1.getCell("C22").font = { bold: true };
        sheet1.getCell("B20").font = { bold: true };
        sheet1.getCell("D22").border = cellBorderStyle;

        // transasction data
        sheet1.getCell("B26").value = "Jumlah Transaksi";
        sheet1.getCell("C25").value = "#Transaksi Kilo";
        sheet1.getCell("D25").value = "#Transaksi Satuan";

        sheet1.getCell("C26").value = reportData.transactionCounts.kilo;
        sheet1.getCell("D26").value = reportData.transactionCounts.satuan;

        sheet1.getCell("B26").font = { bold: true };
        sheet1.getCell("C25").font = { bold: true };
        sheet1.getCell("D25").font = { bold: true };
        sheet1.getCell("C25").border = cellBorderStyle;
        sheet1.getCell("D25").border = cellBorderStyle;
        sheet1.getCell("C26").border = cellBorderStyle;
        sheet1.getCell("D26").border = cellBorderStyle;

        // Deposit data
        sheet1.getCell("B30").value = "Deposit";
        sheet1.getCell("B31").value = "Top Up Deposit";
        sheet1.getCell("B32").value = "Transaksi Deposit";
        sheet1.getCell("C30").value = "#Transaksi";
        sheet1.getCell("D30").value = "Nominal";

        sheet1.getCell("C31").value = reportData.depositData.topUp.transactions;
        sheet1.getCell("D31").value = reportData.depositData.topUp.amount;
        sheet1.getCell("C32").value = reportData.depositData.usage.transactions;
        sheet1.getCell("D32").value = reportData.depositData.usage.amount;

        sheet1.getCell("B30").font = { bold: true };
        sheet1.getCell("C30").font = { bold: true };
        sheet1.getCell("D30").font = { bold: true };
        sheet1.getCell("C30").border = cellBorderStyle;
        sheet1.getCell("D30").border = cellBorderStyle;
        sheet1.getCell("C31").border = cellBorderStyle;
        sheet1.getCell("D31").border = cellBorderStyle;
        sheet1.getCell("C32").border = cellBorderStyle;
        sheet1.getCell("D32").border = cellBorderStyle;

        // Customer Data
        sheet1.getCell("C37").value = "Baru";
        sheet1.getCell("D37").value = "Lama";
        sheet1.getCell("B38").value = "Transaksi Customer";

        sheet1.getCell("C38").value = reportData.customerData.existing;
        sheet1.getCell("D38").value = reportData.customerData.new;

        sheet1.getCell("C37").font = { bold: true };
        sheet1.getCell("D37").font = { bold: true };
        sheet1.getCell("B38").font = { bold: true };
        sheet1.getCell("C37").border = cellBorderStyle;
        sheet1.getCell("D37").border = cellBorderStyle;
        sheet1.getCell("C38").border = cellBorderStyle;
        sheet1.getCell("D38").border = cellBorderStyle;

        // Sheet 1 formulas
        sheet1.getCell("B6").value = "Formula:";
        sheet1.getCell("B7").value = "Penjualan Rupiah";
        sheet1.getCell("B8").value = "Penjualan Kilo";
        sheet1.getCell("B9").value = "Penjualan Satuan";

        sheet1.getCell("C7").value =
          "Nilai transaksi nett setelah dikurangi diskon(bila ada)";
        sheet1.getCell("C8").value =
          "Jumlah kilo hasil dari transaksi laundry kiloan";
        sheet1.getCell("C9").value =
          "Jumlah satuan hasil dari transaksi laundry satuan";

        sheet1.getCell("B23").value = "(formula : cash - pengeluaran)";

        sheet1.getCell("B27").value =
          "(formula : berdasarkan jumlah nota yang dibuat sesuai jenis kategori cucian)";

        sheet1.getCell("B33").value = "Formula:";
        sheet1.getCell("B34").value = "Top Up Deposit";
        sheet1.getCell("B33").value = "Transaksi Deposit";

        sheet1.getCell("C34").value =
          "Customer yang melakukan pembelian  deposit";
        sheet1.getCell("C35").value =
          "Customer yang membayar laundry pakai deposit";

        sheet1.getCell("B40").value = "Formula:";
        sheet1.getCell("B41").value = "Transaksi Customer Baru";
        sheet1.getCell("B42").value = "Transaksi Customer Lama";

        sheet1.getCell("C41").value =
          "Jumlah transaksi customer yang baru pertama kali laundry";
        sheet1.getCell("C42").value =
          "Jumlah transaksi customer yang sudah pernah laundry";

        /// Sheet 1 formula
        const redBoldFont = {
          bold: true,
          color: { argb: "FF0000" },
        };

        sheet1.getCell("B6").font = redBoldFont;
        sheet1.getCell("B7").font = redBoldFont;
        sheet1.getCell("B8").font = redBoldFont;
        sheet1.getCell("B9").font = redBoldFont;
        sheet1.getCell("C7").font = redBoldFont;
        sheet1.getCell("C8").font = redBoldFont;
        sheet1.getCell("C9").font = redBoldFont;
        sheet1.getCell("B23").font = redBoldFont;
        sheet1.getCell("B27").font = redBoldFont;
        sheet1.getCell("B33").font = redBoldFont;
        sheet1.getCell("B34").font = redBoldFont;
        sheet1.getCell("B35").font = redBoldFont;
        sheet1.getCell("B40").font = redBoldFont;
        sheet1.getCell("B41").font = redBoldFont;
        sheet1.getCell("B42").font = redBoldFont;
        sheet1.getCell("C41").font = redBoldFont;
        sheet1.getCell("C42").font = redBoldFont;

        // // ----------- Sheet 2: Detail Breakdown -----------
        sheet2.columns = Array(7).fill({ width: 20 });
 
 // Set uniform column widths starting from B
  sheet2.columns = Array(8).fill({ width: 20 });

  const borderStyle = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // Header
  sheet2.mergeCells("B1:H1");
  const titleCell = sheet2.getCell("B1");
  titleCell.value = "Laporan Jenis Cucian";
  titleCell.font = { bold: true, size: 11 };
  titleCell.alignment = { horizontal: 'center' };

  // Section: Penjualan Hari ini
  sheet2.mergeCells("B4:C4");
  const penjualanCell = sheet2.getCell("B4");
  penjualanCell.value = "Penjualan Hari ini";
  penjualanCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFF00' }, // yellow
  };

  sheet2.getCell("B5").value = "Kategori";
  sheet2.getCell("C5").value = "Group Layanan";
  sheet2.getCell("D5").value = "Jenis Layanan";
  sheet2.getCell("B6").value = "Kiloan";

  // Jenis Layanan
  const layanan = [
    "Cuci Kering Setrika",
    "Setrika",
    "Cuci Kering Lipat < 5kg",
    "Cuci Kering Lipat min 5kg",
    "Cuci Kering Setrika Baju Bayi"
  ];
  layanan.forEach((item, i) => {
    sheet2.getCell(`D${6 + i}`).value = item;
  });

  // Red text for formula
  sheet2.getCell("B12").value = "Formula :";
  sheet2.getCell("C12").value = "Dimunculkan jumlah kilonya dan nominal nilai transaksinya";
  sheet2.getCell("C12").font = { color: { argb: 'FFFF0000' } };

  
  // === Add Kiloan Data ===
  let startRow = 14;
  sheet2.getCell(`B${startRow}`).value = "CONTOH";
  sheet2.getRow(startRow + 1).values = [, "Kategori", "Group Layanan", "Total Kilo", "Nominal", "Jenis Layanan", "Total Kilo", "Nominal"];

  // Regular
  const regular = reportData.serviceBreakdown.kiloan.regular;
  const totalKiloRegular = regular.reduce((sum, item) => sum + item.kilo, 0);
  const totalAmountRegular = regular.reduce((sum, item) => sum + item.amount, 0);
  let row = startRow + 2;
  sheet2.getRow(row).values = [, "Kiloan", "Regular", totalKiloRegular, totalAmountRegular];
  row++;

  for (const item of regular) {
    sheet2.getRow(row).values = [, , , , , item.service, item.kilo, item.amount];
    row++;
  }
  const expressStart = row;

  // Express
  const express = reportData.serviceBreakdown.kiloan.express;
  const totalKiloExpress = express.reduce((sum, item) => sum + item.kilo, 0);
  const totalAmountExpress = express.reduce((sum, item) => sum + item.amount, 0);

  sheet2.getRow(row).values = [, "Kiloan", "Express", totalKiloExpress, totalAmountExpress];
  row++;

  for (const item of express) {
    sheet2.getRow(row).values = [, , , , , item.service, item.kilo, item.amount];
    row++;
  }

  const kiloanEndRow = row - 1;
  const satuanStart = row + 2;

  // === Satuan Header ===
  sheet2.getCell(`B${satuanStart}`).value = "Kategori";
  sheet2.getCell(`C${satuanStart}`).value = "Group Barang";
  sheet2.getCell(`D${satuanStart}`).value = "Total Barang";
  sheet2.getCell(`E${satuanStart}`).value = "Nominal";
  sheet2.getCell(`F${satuanStart}`).value = "Jenis Barang";
  sheet2.getCell(`G${satuanStart}`).value = "Total Barang";
  sheet2.getCell(`H${satuanStart}`).value = "Nominal";

  sheet2.getCell(`B${satuanStart + 2}`).value = "CONTOH";

  // Group by Group Barang (e.g., Bed Cover, Sepatu)
  const groupedSatuan = {};
  for (const item of reportData.serviceBreakdown.satuan) {
    const [group, ...rest] = item.item.split(" ");
    const key = group.trim();
    if (!groupedSatuan[key]) groupedSatuan[key] = [];
    groupedSatuan[key].push(item);
  }

  let satuanRow = satuanStart + 3;
  for (const [group, items] of Object.entries(groupedSatuan)) {
    const totalCount = items.reduce((sum, i) => sum + i.count, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
    sheet2.getRow(satuanRow).values = [, "Satuan", group, totalCount, totalAmount];
    satuanRow++;
    for (const item of items) {
      sheet2.getRow(satuanRow).values = [, , , , , item.item, item.count, item.amount];
      satuanRow++;
    }
  }

  // === Apply Borders ===
  const applyBorders = (fromRow, toRow, fromCol = 2, toCol = 8) => {
    for (let r = fromRow; r <= toRow; r++) {
      for (let c = fromCol; c <= toCol; c++) {
        sheet2.getCell(r, c).border = borderStyle;
      }
    }
  };

  applyBorders(startRow + 1, kiloanEndRow);     // Kiloan table
  applyBorders(satuanStart + 3, satuanRow - 1); // Satuan table


        // Save the file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const today = new Date().toISOString().split("T")[0];
        saveAs(blob, `Laporan-Laundry-${today}.xlsx`);
      }
    } catch (error) {
      console.error("Excel Export Error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, branchId]);

  // console.log(reportData);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-6 w-6" />
          Laporan Penjualan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => generateExcel()}
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
