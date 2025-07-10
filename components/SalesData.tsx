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

        sheet1.spliceRows(7, 9);

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
        sheet1.getCell("C35").value = "Baru";
        sheet1.getCell("D35").value = "Lama";
        sheet1.getCell("B36").value = "Transaksi Customer";

        sheet1.getCell("C36").value = reportData.customerData.existing;
        sheet1.getCell("D36").value = reportData.customerData.new;

        sheet1.getCell("C35").font = { bold: true };
        sheet1.getCell("D35").font = { bold: true };
        sheet1.getCell("B38").font = { bold: true };
        sheet1.getCell("C35").border = cellBorderStyle;
        sheet1.getCell("D35").border = cellBorderStyle;
        sheet1.getCell("C36").border = cellBorderStyle;
        sheet1.getCell("D36").border = cellBorderStyle;

        // // ----------- Sheet 2: Detail Breakdown -----------
        sheet2.columns = Array(7).fill({ width: 20 });
        sheet2.mergeCells("B1:H1");
        sheet2.getCell("B1").value = "Laporan Jenis Cucian";

        sheet2.mergeCells("B4:C4");
        sheet2.getCell("B4").value = "Penjualan Hari ini";
        sheet2.getCell("B5").value = "Kategori";
        sheet2.getCell("C5").value = "Group Layanan";
        sheet2.getCell("D5").value = "Jenis Layanan";

        sheet2
          .addRow([
            "Kategori",
            "Group",
            "Jenis Layanan",
            "Total Kilo",
            "Nominal",
          ])
          .eachCell((c: any) => (c.style = cellBorderStyle));

        // const kiloan = reportData.serviceBreakdown?.kiloan || {};
        // const renderKiloan = (groupName: string, data: any[]) => {
        //   data.forEach((service) => {
        //     sheet2
        //       .addRow([
        //         "Kiloan",
        //         groupName,
        //         service.service,
        //         service.kilo,
        //         service.amount,
        //       ])
        //       .eachCell((c) => (c.style = cellStyle));
        //   });
        // };

        // renderKiloan("Regular", kiloan.regular || []);
        // renderKiloan("Express", kiloan.express || []);

        // // Satuan
        // sheet2.addRow([]);
        // sheet2
        //   .addRow(["Kategori", "Jenis Barang", "Total Barang", "Nominal"])
        //   .eachCell((c) => (c.style = headerStyle));

        // const satuan = reportData.serviceBreakdown?.satuan || [];
        // satuan.forEach((item) => {
        //   sheet2
        //     .addRow(["Satuan", item.item, item.count, item.amount])
        //     .eachCell((c) => (c.style = cellStyle));
        // });

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
  }, []);

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
