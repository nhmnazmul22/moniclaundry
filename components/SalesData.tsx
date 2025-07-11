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



// Parse ISO strings
const start1 = new Date(startDate);
const end1 = new Date(endDate);

// Remove time
const startdate = new Date(start1.getFullYear(), start1.getMonth(), start1.getDate());
const enddate = new Date(end1.getFullYear(), end1.getMonth(), end1.getDate());



let headerText1 = "";

if (
  startdate.getFullYear() === startdate.getFullYear() &&
  startdate.getMonth() === startdate.getMonth() &&
  startdate.getDate() === startdate.getDate()
) {
  headerText1 = "Penjualan Hari ini";
} else if (startdate.getMonth() === startdate.getMonth() && startdate.getFullYear() === startdate.getFullYear()) {
  headerText1 = "Penjualan Bulan Ini";
} else {
  headerText1 = `Penjualan Periode (${startDate} s.d ${endDate})`;
}





        sheet1.getCell("B2").value = headerText1;
        sheet1.getCell("B2").font = { bold: true };

        // Sales Data
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

// ---- Sheet 2: Detail Breakdown -----------

const borderStyle = {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  };

  sheet2.columns = Array(7).fill({ width: 20 });

  // Header
  sheet2.mergeCells("B1:H1");
  sheet2.getCell("B1").value = "Laporan Jenis Cucian";
  sheet2.getCell("B1").alignment = { horizontal: "center" };
  sheet2.getCell("B1").font = { bold: true, size: 14 };


// Parse ISO strings
const start = new Date(startDate);
const end = new Date(endDate);

let headerText = "";

if (
  start.getFullYear() === end.getFullYear() &&
  start.getMonth() === end.getMonth() &&
  start.getDate() === end.getDate()
) {
  headerText = "Penjualan Hari ini";
} else if (start.getMonth() === end.getMonth()) {
  headerText = "Penjualan Bulan Ini";
} else {
  headerText = `Penjualan Periode (${startDate} s.d ${endDate})`;
}

// Apply to Excel
sheet2.mergeCells("B4:C4");
const headerCell = sheet2.getCell("B4");
headerCell.value = headerText;
headerCell.font = { bold: true };
headerCell.alignment = { horizontal: "center" };




  sheet2.getCell("B5").value = "Kategori";
  sheet2.getCell("C5").value = "Group Layanan";
  sheet2.getCell("D5").value = "Jenis Layanan";

  // Dynamic Jenis Layanan
  const regular = reportData.serviceBreakdown.kiloan.regular || [];
  const express = reportData.serviceBreakdown.kiloan.express || [];
  const uniqueServices = Array.from(new Set([...regular, ...express].map(i => i.service)));

  let rowIdx = 6;
  uniqueServices.forEach((service, index) => {
    sheet2.getCell(`B${rowIdx}`).value = index === 0 ? "Kiloan" : "";
    sheet2.getCell(`D${rowIdx}`).value = service;
    rowIdx++;
  });

  for (let r = 4; r < rowIdx; r++) {
    for (let c = 2; c <= 4; c++) {
      sheet2.getCell(r, c).border = borderStyle;
    }
  }

  // Kiloan Summary
  let summaryStart = rowIdx + 2;
  sheet2.getCell(`B${summaryStart}`).value = "CONTOH";
  summaryStart++;
  sheet2.getRow(summaryStart).values = [
    " ", "Kategori", "Group Layanan", "Total Kilo", "Nominal", "Jenis Layanan", "Total Kilo", "Nominal"
  ];
  sheet2.getRow(summaryStart).eachCell(cell => cell.border = borderStyle);

sheet2.getCell("A10").border = {};

  let row = summaryStart + 1;
  const renderKiloanGroup = (label: string, data: any[]) => {
    const totalKilo = data.reduce((sum, i) => sum + i.kilo, 0);
    const totalAmount = data.reduce((sum, i) => sum + i.amount, 0);
    sheet2.getCell(`B${row}`).value = "Kiloan";
    sheet2.getCell(`C${row}`).value = label;
    sheet2.getCell(`D${row}`).value = totalKilo;
    sheet2.getCell(`E${row}`).value = totalAmount.toLocaleString();
    sheet2.getRow(row).eachCell(cell => cell.border = borderStyle);

    data.forEach(i => {
      row++;
      sheet2.getCell(`F${row}`).value = i.service;
      sheet2.getCell(`G${row}`).value = i.kilo;
      sheet2.getCell(`H${row}`).value = i.amount.toLocaleString();
      sheet2.getRow(row).eachCell(cell => cell.border = borderStyle);
    });
    row++;
  };

  renderKiloanGroup("Regular", regular);
  renderKiloanGroup("Express", express);

  // Satuan Summary
  row++;
  sheet2.getCell(`B${row}`).value = "Kategori";
  sheet2.getCell(`C${row}`).value = "Group Barang";
  sheet2.getCell(`D${row}`).value = "Total Barang";
  sheet2.getCell(`E${row}`).value = "Nominal";
  sheet2.getCell(`F${row}`).value = "Jenis Barang";
  sheet2.getCell(`G${row}`).value = "Total Barang";
  sheet2.getCell(`H${row}`).value = "Nominal";
  sheet2.getRow(row).eachCell(cell => cell.border = borderStyle);
  row++;

  const groupedItems = reportData.serviceBreakdown.satuan.reduce((acc: any, item: any) => {
    if (!acc[item.item]) acc[item.item] = [];
    acc[item.item].push(item);
    return acc;
  }, {});

  for (const group in groupedItems) {
    const items = groupedItems[group];
    const totalCount = items.reduce((sum: number, i: any) => sum + i.count, 0);
    const totalNominal = items.reduce((sum: number, i: any) => sum + i.amount, 0);

    sheet2.getCell(`B${row}`).value = "Satuan";
    sheet2.getCell(`C${row}`).value = group;
    sheet2.getCell(`D${row}`).value = totalCount;
    sheet2.getCell(`E${row}`).value = totalNominal.toLocaleString();
    sheet2.getRow(row).eachCell(cell => cell.border = borderStyle);

    items.forEach(i => {
      row++;
      sheet2.getCell(`F${row}`).value = i.item;
      sheet2.getCell(`G${row}`).value = i.count;
      sheet2.getCell(`H${row}`).value = i.amount.toLocaleString();
      sheet2.getRow(row).eachCell(cell => cell.border = borderStyle);
    });
    row++;
  }
        

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
