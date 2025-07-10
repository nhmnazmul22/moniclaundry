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

        const sheet1 = workbook.addWorksheet("Laporan Harian");
        const sheet2 = workbook.addWorksheet("Detail Layanan");

        const headerStyle = {
          font: { bold: true },
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          },
        };

        const cellBorderStyle: Partial<ExcelJS.Borders> = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // ----------- Sheet 1: Summary Report -----------
        sheet1.columns = Array(7).fill({ width: 20 });
        sheet1.getCell("B2").value = "Penjualan Hari Ini";

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


        

        // row += 4;
        // sheet1.getCell(`A${row}`).value = "";
        // sheet1.getCell(`A${row}`).style = headerStyle;
        // sheet1
        //   .addRow(["", "#Transaksi", "Nominal"])
        //   .eachCell((c) => (c.style = headerStyle));

        // const methods = ["cash", "transfer", "qris", "deposit"];
        // methods.forEach((method) => {
        //   const data = reportData.paymentBreakdown?.[method] || {};
        //   sheet1
        //     .addRow([
        //       method.toUpperCase(),
        //       data.transactions || 0,
        //       data.amount || 0,
        //     ])
        //     .eachCell((c) => (c.style = cellStyle));
        // });

        // // Expenses
        // sheet1.addRow([]);
        // sheet1
        //   .addRow(["Pengeluaran", reportData.expenses || 0])
        //   .eachCell((c) => (c.style = cellStyle));
        // sheet1
        //   .addRow(["Nett Cash", reportData.netCash || 0])
        //   .eachCell((c) => (c.style = cellStyle));

        // // Transaction counts
        // sheet1.addRow([]);
        // sheet1.getCell(`A${sheet1.lastRow.number + 1}`).value =
        //   "Jumlah Transaksi";
        // sheet1.getCell(`A${sheet1.lastRow.number}`).style = headerStyle;
        // sheet1
        //   .addRow(["", "#Transaksi Kilo", "#Transaksi Satuan"])
        //   .eachCell((c) => (c.style = headerStyle));
        // sheet1
        //   .addRow([
        //     "",
        //     reportData.transactionCounts?.kilo || 0,
        //     reportData.transactionCounts?.satuan || 0,
        //   ])
        //   .eachCell((c) => (c.style = cellStyle));

        // // Deposit
        // sheet1.addRow([]);
        // sheet1.getCell(`A${sheet1.lastRow.number + 1}`).value = "Deposit";
        // sheet1.getCell(`A${sheet1.lastRow.number}`).style = headerStyle;
        // sheet1
        //   .addRow(["", "#Transaksi", "Nominal"])
        //   .eachCell((c: any) => (c.style = headerStyle));

        // sheet1
        //   .addRow([
        //     "Top Up Deposit",
        //     reportData.depositData?.topUp.transactions || 0,
        //     reportData.depositData?.topUp.amount || 0,
        //   ])
        //   .eachCell((c: any) => (c.style = cellStyle));
        // sheet1
        //   .addRow([
        //     "Transaksi Deposit",
        //     reportData.depositData?.usage.transactions || 0,
        //     reportData.depositData?.usage.amount || 0,
        //   ])
        //   .eachCell((c) => (c.style = cellStyle));

        // // Customer Data
        // sheet1.addRow([]);
        // sheet1
        //   .addRow(["Transaksi Customer", "Baru", "Lama"])
        //   .eachCell((c: any) => (c.style = headerStyle));
        // sheet1
        //   .addRow([
        //     "",
        //     reportData.customerData?.new || 0,
        //     reportData.customerData?.existing || 0,
        //   ])
        //   .eachCell((c: any) => (c.style = cellStyle));

        // // ----------- Sheet 2: Detail Breakdown -----------
        // sheet2.columns = Array(7).fill({ width: 20 });
        // sheet2.mergeCells("A1:G1");
        // sheet2.getCell("A1").value = "Laporan Jenis Cucian";
        // sheet2.getCell("A1").style = headerStyle;

        // sheet2
        //   .addRow([
        //     "Kategori",
        //     "Group",
        //     "Jenis Layanan",
        //     "Total Kilo",
        //     "Nominal",
        //   ])
        //   .eachCell((c: any) => (c.style = headerStyle));

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
