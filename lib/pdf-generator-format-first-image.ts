import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import type { EnhancedReportData } from "./pdf-generator-enhanced";

export const generateFirstImageFormat = async (data: EnhancedReportData) => {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Helper functions
  const drawBox = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill = false
  ) => {
    if (fill) {
      doc.setFillColor(240, 240, 240); // Light gray
      doc.rect(x, y, width, height, "FD");
    } else {
      doc.rect(x, y, width, height);
    }
  };

  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, options);
  };

  // Column setup
  const colWidth = (pageWidth - margin * 2 - 20) / 3;
  const col1X = margin;
  const col2X = margin + colWidth + 10;
  const col3X = margin + colWidth * 2 + 20;

  let currentY = margin + 10;

  // Column headers
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  drawBox(col1X, currentY, colWidth, 8);
  addText("Penjualan Hari ini", col1X + 2, currentY + 6);

  drawBox(col2X, currentY, colWidth, 8);
  addText("Penjualan Bulan ini", col2X + 2, currentY + 6);

  drawBox(col3X, currentY, colWidth, 8);
  addText("Penjualan Periode (ddmmyyyy s/d ddmmyyyy)", col3X + 2, currentY + 6);

  currentY += 12;

  // Function to add complete column data
  const addCompleteColumn = (x: number, colW: number) => {
    let y = currentY;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    // Sales Data Section
    addText("Rupiah", x + 2, y + 5);
    drawBox(x + colW * 0.6, y, colW * 0.4, 6);
    addText(
      data.salesData.rupiah.toLocaleString("id-ID"),
      x + colW * 0.6 + 2,
      y + 4
    );

    y += 8;
    addText("Jumlah Kilo", x + 2, y + 5);
    drawBox(x + colW * 0.6, y, colW * 0.4, 6);
    addText(data.salesData.kilo.toFixed(1), x + colW * 0.6 + 2, y + 4);

    y += 8;
    addText("Jumlah Satuan", x + 2, y + 5);
    drawBox(x + colW * 0.6, y, colW * 0.4, 6);
    addText(data.salesData.satuan.toString(), x + colW * 0.6 + 2, y + 4);

    y += 10;

    // Formulas in red
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(7);
    addText("Formulas :", x + 2, y);
    addText("Penjualan Rupiah", x + 2, y + 4);
    addText("Penjualan Kilo", x + 2, y + 8);
    addText("Penjualan Satuan", x + 2, y + 12);
    doc.setTextColor(0, 0, 0);

    y += 18;

    // Payment Methods Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    addText("Cara Bayar", x + 2, y + 5);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    // Payment table headers
    drawBox(x, y, colW * 0.4, 5);
    addText("", x + 2, y + 3);
    drawBox(x + colW * 0.4, y, colW * 0.3, 5);
    addText("#Transaksi", x + colW * 0.4 + 2, y + 3);
    drawBox(x + colW * 0.7, y, colW * 0.3, 5);
    addText("Nominal", x + colW * 0.7 + 2, y + 3);

    y += 5;

    // Payment rows
    const payments = [
      { name: "Cash", data: data.paymentMethods.cash },
      { name: "Transfer", data: data.paymentMethods.transfer },
      { name: "QRIS", data: data.paymentMethods.qris },
      { name: "Deposit", data: data.paymentMethods.deposit },
    ];

    payments.forEach((payment) => {
      drawBox(x, y, colW * 0.4, 5);
      addText(payment.name, x + 2, y + 3);
      drawBox(x + colW * 0.4, y, colW * 0.3, 5);
      addText(payment.data.transactions.toString(), x + colW * 0.4 + 2, y + 3);
      drawBox(x + colW * 0.7, y, colW * 0.3, 5);
      addText(
        payment.data.nominal.toLocaleString("id-ID"),
        x + colW * 0.7 + 2,
        y + 3
      );
      y += 5;
    });

    y += 5;

    // Piutang section
    drawBox(x, y, colW * 0.4, 5);
    addText("Piutang", x + 2, y + 3);
    drawBox(x + colW * 0.4, y, colW * 0.3, 5);
    addText("#Transaksi", x + colW * 0.4 + 2, y + 3);
    drawBox(x + colW * 0.7, y, colW * 0.3, 5);
    addText("Nominal", x + colW * 0.7 + 2, y + 3);

    y += 8;

    // Pengeluaran section
    drawBox(x, y, colW, 5);
    addText("Pengeluaran", x + 2, y + 3);

    y += 8;

    // Net Cash section
    drawBox(x, y, colW, 5);
    doc.setTextColor(255, 0, 0);
    doc.setFont("helvetica", "bold");
    addText("Nett Cash", x + 2, y + 3);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    y += 5;
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(6);
    addText("(formasi : cash - pengeluaran)", x + 2, y + 3);
    doc.setTextColor(0, 0, 0);

    y += 10;

    // Transaction Count Section
    doc.setTextColor(255, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    addText("Jumlah Transaksi", x + 2, y + 3);
    addText(
      "(formasi : berdasarkan jumlah nota yang dibuat sesuai jenis kategori",
      x + 2,
      y + 7
    );
    addText("cuci)", x + 2, y + 11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    y += 15;

    drawBox(x, y, colW / 2, 5);
    addText("#Transaksi Kilo", x + 2, y + 3);
    drawBox(x + colW / 2, y, colW / 2, 5);
    addText("#Transaksi Satuan", x + colW / 2 + 2, y + 3);

    y += 5;
    drawBox(x, y, colW / 2, 5);
    addText(data.transactionCount.kilo.toString(), x + 2, y + 3);
    drawBox(x + colW / 2, y, colW / 2, 5);
    addText(data.transactionCount.satuan.toString(), x + colW / 2 + 2, y + 3);

    y += 10;

    // Deposit Section
    doc.setFontSize(7);
    drawBox(x, y, colW * 0.4, 5);
    addText("Deposit", x + 2, y + 3);
    drawBox(x + colW * 0.4, y, colW * 0.3, 5);
    addText("#Transaksi", x + colW * 0.4 + 2, y + 3);
    drawBox(x + colW * 0.7, y, colW * 0.3, 5);
    addText("Nominal", x + colW * 0.7 + 2, y + 3);

    y += 5;
    drawBox(x, y, colW * 0.4, 5);
    addText("Top Up Deposit", x + 2, y + 3);
    drawBox(x + colW * 0.4, y, colW * 0.3, 5);
    addText(
      data.depositDetails.topUpDeposit.transactions.toString(),
      x + colW * 0.4 + 2,
      y + 3
    );
    drawBox(x + colW * 0.7, y, colW * 0.3, 5);
    addText(
      data.depositDetails.topUpDeposit.nominal.toLocaleString("id-ID"),
      x + colW * 0.7 + 2,
      y + 3
    );

    y += 5;
    drawBox(x, y, colW * 0.4, 5);
    addText("Transaksi Deposit", x + 2, y + 3);
    drawBox(x + colW * 0.4, y, colW * 0.3, 5);
    addText(
      data.depositDetails.transactionDeposit.transactions.toString(),
      x + colW * 0.4 + 2,
      y + 3
    );
    drawBox(x + colW * 0.7, y, colW * 0.3, 5);
    addText(
      data.depositDetails.transactionDeposit.nominal.toLocaleString("id-ID"),
      x + colW * 0.7 + 2,
      y + 3
    );

    y += 8;

    // Deposit formulas in red
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(6);
    addText("Top Up Deposit", x + 2, y);
    addText("Transaksi Deposit", x + 2, y + 4);
    doc.setTextColor(0, 0, 0);

    y += 10;

    // Customer Transaction Section
    drawBox(x, y, colW / 2, 5);
    addText("Baru", x + 2, y + 3);
    drawBox(x + colW / 2, y, colW / 2, 5);
    addText("Lama", x + colW / 2 + 2, y + 3);

    y += 5;
    drawBox(x, y, colW, 5);
    addText("Transaksi Customer", x + 2, y + 3);

    y += 8;

    // Customer formulas in red
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(6);
    addText("Formula :", x + 2, y);
    addText("Transaksi Customer Baru", x + 2, y + 4);
    addText("Transaksi Customer Lama", x + 2, y + 8);
    doc.setTextColor(0, 0, 0);

    return y + 15;
  };

  // Add all three columns
  addCompleteColumn(col1X, colWidth);
  addCompleteColumn(col2X, colWidth);
  addCompleteColumn(col3X, colWidth);

  // Save PDF
  const fileName = `Laporan_Format_Image1_${format(
    data.dateRange.from,
    "yyyyMMdd"
  )}_${format(data.dateRange.to, "yyyyMMdd")}.pdf`;
  doc.save(fileName);
};
