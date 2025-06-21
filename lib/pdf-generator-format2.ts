import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import type { EnhancedReportData } from "./pdf-generator-enhanced";

export const generateSecondFormatReport = async (data: EnhancedReportData) => {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 8;
  const usableWidth = pageWidth - margin * 2;

  doc.setFont("helvetica");

  // Helper functions
  const drawBox = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill = false
  ) => {
    if (fill) {
      doc.setFillColor(255, 255, 0); // Yellow highlight
      doc.rect(x, y, width, height, "FD");
    } else {
      doc.rect(x, y, width, height);
    }
  };

  const addText = (text: string, x: number, y: number, maxWidth?: number) => {
    if (maxWidth && doc.getTextWidth(text) > maxWidth) {
      const truncated =
        text.substring(
          0,
          Math.floor((text.length * maxWidth) / doc.getTextWidth(text))
        ) + "...";
      doc.text(truncated, x, y);
    } else {
      doc.text(text, x, y);
    }
  };

  // Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN JUAL CUCI", pageWidth / 2, margin + 8, { align: "center" });

  let currentY = margin + 20;

  // Three column headers with yellow background
  const colWidth = usableWidth / 3;
  const col1X = margin;
  const col2X = margin + colWidth;
  const col3X = margin + colWidth * 2;

  // Column headers
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");

  drawBox(col1X, currentY, colWidth, 6, true);
  addText("Penjualan Hari ini", col1X + 2, currentY + 4);
  drawBox(col1X, currentY + 6, colWidth / 2, 4, true);
  addText("Kategori Group Layi", col1X + 2, currentY + 9);
  drawBox(col1X + colWidth / 2, currentY + 6, colWidth / 2, 4, true);
  addText("Jenis Layanan", col1X + colWidth / 2 + 2, currentY + 9);

  drawBox(col2X, currentY, colWidth, 6, true);
  addText("Penjualan Bulan ini", col2X + 2, currentY + 4);
  drawBox(col2X, currentY + 6, colWidth / 2, 4, true);
  addText("Kategori Group Layi", col2X + 2, currentY + 9);
  drawBox(col2X + colWidth / 2, currentY + 6, colWidth / 2, 4, true);
  addText("Jenis Layanan", col2X + colWidth / 2 + 2, currentY + 9);

  drawBox(col3X, currentY, colWidth, 6, true);
  addText(
    "Penjualan Periode (ddmmyyyy s/d ddmmyyyy)",
    col3X + 2,
    currentY + 4,
    colWidth - 4
  );
  drawBox(col3X, currentY + 6, colWidth / 2, 4, true);
  addText("Kategori Group Layi", col3X + 2, currentY + 9);
  drawBox(col3X + colWidth / 2, currentY + 6, colWidth / 2, 4, true);
  addText("Jenis Layanan", col3X + colWidth / 2 + 2, currentY + 9);

  currentY += 12;

  // Service categories table for each column
  const addServiceTable = (x: number, colW: number) => {
    let y = currentY;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    // Headers
    const headers = [
      "Kategori Group Layi",
      "Total Kilo",
      "Harga",
      "Nominal",
      "Jenis Layanan",
      "Total Kilo",
      "Nominal",
    ];
    const colWidths = [
      colW * 0.2,
      colW * 0.1,
      colW * 0.1,
      colW * 0.15,
      colW * 0.2,
      colW * 0.1,
      colW * 0.15,
    ];

    let headerX = x;
    headers.forEach((header, i) => {
      drawBox(headerX, y, colWidths[i], 5);
      addText(header, headerX + 1, y + 3, colWidths[i] - 2);
      headerX += colWidths[i];
    });

    y += 5;

    // Data rows
    const serviceData = [
      {
        category: "Kiloan",
        type: "Regular",
        kilo: data.serviceCategories.regular.kilo,
        price: data.serviceCategories.regular.price,
        total: data.serviceCategories.regular.total,
      },
      {
        category: "",
        type: "Express",
        kilo: data.serviceCategories.express.kilo,
        price: data.serviceCategories.express.price,
        total: data.serviceCategories.express.total,
      },
    ];

    serviceData.forEach((service) => {
      let rowX = x;

      // Category
      drawBox(rowX, y, colWidths[0], 5);
      addText(service.category, rowX + 1, y + 3);
      rowX += colWidths[0];

      // Total Kilo
      drawBox(rowX, y, colWidths[1], 5);
      addText(service.kilo.toFixed(1), rowX + 1, y + 3);
      rowX += colWidths[1];

      // Price
      drawBox(rowX, y, colWidths[2], 5);
      addText(service.price.toLocaleString(), rowX + 1, y + 3);
      rowX += colWidths[2];

      // Nominal
      drawBox(rowX, y, colWidths[3], 5);
      addText(
        service.total.toLocaleString(),
        rowX + 1,
        y + 3,
        colWidths[3] - 2
      );
      rowX += colWidths[3];

      // Service Type
      drawBox(rowX, y, colWidths[4], 5);
      addText(service.type, rowX + 1, y + 3);
      rowX += colWidths[4];

      // Service Kilo
      drawBox(rowX, y, colWidths[5], 5);
      addText(service.kilo.toFixed(1), rowX + 1, y + 3);
      rowX += colWidths[5];

      // Service Total
      drawBox(rowX, y, colWidths[6], 5);
      addText(
        service.total.toLocaleString(),
        rowX + 1,
        y + 3,
        colWidths[6] - 2
      );

      y += 5;
    });

    // Express totals
    y += 2;
    let totalX = x;
    drawBox(totalX, y, colWidths[0], 5);
    addText("Express", totalX + 1, y + 3);
    totalX += colWidths[0];

    drawBox(totalX, y, colWidths[1], 5);
    addText(data.serviceCategories.express.kilo.toFixed(1), totalX + 1, y + 3);
    totalX += colWidths[1];

    drawBox(totalX, y, colWidths[2] + colWidths[3], 5);
    addText(
      data.serviceCategories.express.total.toLocaleString(),
      totalX + 1,
      y + 3
    );

    return y + 8;
  };

  // Add service tables for all columns
  addServiceTable(col1X, colWidth);
  addServiceTable(col2X, colWidth);
  addServiceTable(col3X, colWidth);

  currentY += 25;

  // Category breakdown section
  const addCategoryBreakdown = (x: number, colW: number) => {
    let y = currentY;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");

    drawBox(x, y, colW, 5, true);
    addText("Kategori/Group Barang", x + 2, y + 3);

    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    // Headers
    const headers = [
      "Total Barang",
      "Nominal",
      "Jenis Barang",
      "Total Barang",
      "Nominal",
    ];
    const colWidths = [
      colW * 0.2,
      colW * 0.2,
      colW * 0.2,
      colW * 0.2,
      colW * 0.2,
    ];

    let headerX = x;
    headers.forEach((header, i) => {
      drawBox(headerX, y, colWidths[i], 5);
      addText(header, headerX + 1, y + 3, colWidths[i] - 2);
      headerX += colWidths[i];
    });

    y += 5;

    // Sample data rows
    const categoryData = [
      { name: "Bed Cover 200 cm", qty: 10, price: 350000 },
      { name: "Bed Cover 160 cm", qty: 5, price: 250000 },
      { name: "Sepatu", qty: 15, price: 300000 },
    ];

    categoryData.forEach((item) => {
      let rowX = x;

      drawBox(rowX, y, colWidths[0], 5);
      addText(item.qty.toString(), rowX + 1, y + 3);
      rowX += colWidths[0];

      drawBox(rowX, y, colWidths[1], 5);
      addText(item.price.toLocaleString(), rowX + 1, y + 3, colWidths[1] - 2);
      rowX += colWidths[1];

      drawBox(rowX, y, colWidths[2], 5);
      addText(item.name, rowX + 1, y + 3, colWidths[2] - 2);
      rowX += colWidths[2];

      drawBox(rowX, y, colWidths[3], 5);
      addText(item.qty.toString(), rowX + 1, y + 3);
      rowX += colWidths[3];

      drawBox(rowX, y, colWidths[4], 5);
      addText(item.price.toLocaleString(), rowX + 1, y + 3, colWidths[4] - 2);

      y += 5;
    });

    return y + 5;
  };

  // Add category breakdown for all columns
  addCategoryBreakdown(col1X, colWidth);
  addCategoryBreakdown(col2X, colWidth);
  addCategoryBreakdown(col3X, colWidth);

  // Save the second format PDF
  const fileName = `Laporan_Laundry_Format2_${format(
    data.dateRange.from,
    "yyyyMMdd"
  )}_${format(data.dateRange.to, "yyyyMMdd")}.pdf`;
  doc.save(fileName);
};
