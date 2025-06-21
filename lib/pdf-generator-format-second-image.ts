import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import type { EnhancedReportData } from "./pdf-generator-enhanced";

export const generateSecondImageFormat = async (data: EnhancedReportData) => {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 8;

  // Helper functions
  const drawBox = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill = false
  ) => {
    if (fill) {
      doc.setFillColor(255, 255, 0); // Yellow
      doc.rect(x, y, width, height, "FD");
    } else {
      doc.rect(x, y, width, height);
    }
  };

  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, options);
  };

  // Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  addText("Laporan Jual Cuci", pageWidth / 2, margin + 8, { align: "center" });

  const currentY = margin + 20;

  // Column setup
  const colWidth = (pageWidth - margin * 2 - 20) / 3;
  const col1X = margin;
  const col2X = margin + colWidth + 10;
  const col3X = margin + colWidth * 2 + 20;

  // Function to add service detail column
  const addServiceDetailColumn = (x: number, colW: number, title: string) => {
    let y = currentY;

    // Yellow header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    drawBox(x, y, colW, 6, true);
    addText(title, x + 2, y + 4);

    // Sub headers
    drawBox(x, y + 6, colW / 2, 4, true);
    addText("Kategori Group Layi", x + 2, y + 9);
    drawBox(x + colW / 2, y + 6, colW / 2, 4, true);
    addText("Jenis Layanan", x + colW / 2 + 2, y + 9);

    y += 12;

    // Service table
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    // Table headers
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
      colW * 0.18,
      colW * 0.12,
      colW * 0.12,
      colW * 0.18,
      colW * 0.18,
      colW * 0.12,
      colW * 0.1,
    ];

    let headerX = x;
    headers.forEach((header, i) => {
      drawBox(headerX, y, colWidths[i], 5);
      addText(header, headerX + 1, y + 3);
      headerX += colWidths[i];
    });

    y += 5;

    // Service data rows
    const serviceItems = [
      {
        category: "Kiloan",
        type: "Regular",
        kilo: 100,
        price: 1205000,
        total: 3000,
      },
      { category: "", type: "Santis", kilo: 20, price: 160000, total: 10000 },
      {
        category: "",
        type: "Cuci Kering Lipat < 5kg",
        kilo: 5,
        price: 25000,
        total: 40,
      },
      {
        category: "",
        type: "Cuci Kering Lipat min 5kg",
        kilo: 3,
        price: 21000,
        total: 50,
      },
      {
        category: "",
        type: "Cuci Kering Santis Baju Bayi",
        kilo: 10,
        price: 100000,
        total: 100,
      },
    ];

    serviceItems.forEach((item) => {
      let rowX = x;
      const rowData = [
        item.category,
        item.kilo.toString(),
        item.price.toLocaleString(),
        item.total.toLocaleString(),
        item.type,
        item.kilo.toString(),
        item.total.toLocaleString(),
      ];

      rowData.forEach((data, i) => {
        drawBox(rowX, y, colWidths[i], 5);
        addText(data, rowX + 1, y + 3);
        rowX += colWidths[i];
      });
      y += 5;
    });

    y += 3;

    // Express section
    let expressX = x;
    drawBox(expressX, y, colWidths[0], 5);
    addText("Express", expressX + 1, y + 3);
    expressX += colWidths[0];

    drawBox(expressX, y, colWidths[1], 5);
    addText("19.3", expressX + 1, y + 3);
    expressX += colWidths[1];

    drawBox(expressX, y, colWidths[2] + colWidths[3], 5);
    addText("160,400", expressX + 1, y + 3);

    y += 8;

    // Formulas in red
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(6);
    addText("Formulas :", x + 2, y);
    addText(
      "Dihancurkan jumlah kilogram dan nominal nilai transaksinya",
      x + 2,
      y + 4
    );
    doc.setTextColor(0, 0, 0);

    y += 10;

    // Category/Group Barang section
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    drawBox(x, y, colW, 5);
    addText("Kategori/Group Barang", x + 2, y + 3);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(255, 0, 0);
    addText("Formulas :", x + 2, y);
    addText("Dihancurkan jumlah total barangnya", x + 2, y + 4);
    doc.setTextColor(0, 0, 0);

    y += 10;

    // Category table headers
    const catHeaders = [
      "Kategori/Group Barang",
      "Total Barang",
      "Nominal",
      "Jenis Barang",
      "Total Barang",
      "Nominal",
    ];
    const catColWidths = [
      colW * 0.2,
      colW * 0.15,
      colW * 0.15,
      colW * 0.2,
      colW * 0.15,
      colW * 0.15,
    ];

    let catHeaderX = x;
    catHeaders.forEach((header, i) => {
      drawBox(catHeaderX, y, catColWidths[i], 5);
      addText(header, catHeaderX + 1, y + 3);
      catHeaderX += catColWidths[i];
    });

    y += 5;

    // CONTOH section
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    addText("CONTOH", x + 2, y + 8);

    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);

    // Category items
    const categoryItems = [
      { category: "Selimut", item: "Bed Cover 200 cm", qty: 10, price: 350000 },
      { category: "", item: "Bed Cover 160 cm", qty: 4, price: 250000 },
      { category: "", item: "Bed Cover Max 160 cm", qty: 2, price: 50000 },
      { category: "Sepatu", item: "Sepatu Boots", qty: 15, price: 150000 },
      { category: "", item: "Sepatu Flat/Teplek", qty: 2, price: 40000 },
      {
        category: "",
        item: "Sepatu Kulit/Sneaker/Premi",
        qty: 1,
        price: 60000,
      },
    ];

    categoryItems.forEach((item) => {
      let catRowX = x;
      const catRowData = [
        item.category,
        item.qty.toString(),
        item.price.toLocaleString(),
        item.item,
        item.qty.toString(),
        item.price.toLocaleString(),
      ];

      catRowData.forEach((data, i) => {
        drawBox(catRowX, y, catColWidths[i], 5);
        addText(data, catRowX + 1, y + 3);
        catRowX += catColWidths[i];
      });
      y += 5;
    });

    return y + 10;
  };

  // Add all three columns
  addServiceDetailColumn(col1X, colWidth, "Penjualan Hari ini");
  addServiceDetailColumn(col2X, colWidth, "Penjualan Bulan ini");
  addServiceDetailColumn(
    col3X,
    colWidth,
    "Penjualan Periode (ddmmyyyy s/d ddmmyyyy)"
  );

  // Save PDF
  const fileName = `Laporan_Format_Image2_${format(
    data.dateRange.from,
    "yyyyMMdd"
  )}_${format(data.dateRange.to, "yyyyMMdd")}.pdf`;
  doc.save(fileName);
};
