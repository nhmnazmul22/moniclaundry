import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DateRange } from "react-day-picker";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

export interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  growthRate?: number;
  dailyBreakdown: Array<{
    date: string;
    revenue: number;
    orders: number;
    avgPerOrder: number;
  }>;
  topServices?: Array<{ name: string; count: number; revenue: number }>;
  paymentMethods?: { [key: string]: number };
  salesData: {
    rupiah: number;
    kilo: number;
    satuan: number;
  };
  paymentBreakdown: {
    cash: { transactions: number; amount: number };
    transfer: { transactions: number; amount: number };
    qris: { transactions: number; amount: number };
    deposit: { transactions: number; amount: number };
  };
  expenses: number;
  netCash: number;
  transactionCounts: {
    kilo: number;
    satuan: number;
  };
  depositData: {
    topUp: { transactions: number; amount: number };
    usage: { transactions: number; amount: number };
  };
  customerData: {
    new: number;
    existing: number;
  };
  serviceBreakdown: {
    kiloan: {
      regular: Array<{ service: string; kilo: number; amount: number }>;
      express: Array<{ service: string; kilo: number; amount: number }>;
    };
    satuan: Array<{ item: string; count: number; amount: number }>;
  };
}

export class LaundryPDFGenerator {
  private doc: jsPDF;
  private yPosition = 20;
  private pageHeight = 297; // A4 height in mm
  private marginBottom = 20;

  constructor() {
    try {
      this.doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
    } catch (error) {
      console.error("Error initializing jsPDF:", error);
      throw new Error("Failed to initialize PDF generator");
    }
  }

  private checkPageBreak(requiredSpace = 30): void {
    if (this.yPosition + requiredSpace > this.pageHeight - this.marginBottom) {
      this.doc.addPage();
      this.yPosition = 20;
    }
  }

  private addHeader(dateRange: DateRange | undefined): void {
    try {
      // Company Header
      this.doc.setFontSize(20);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("LAPORAN PENJUALAN LAUNDRY", 105, this.yPosition, {
        align: "center",
      });
      this.yPosition += 8;

      // Subtitle
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "normal");
      this.doc.text("Sistem Manajemen Laundry", 105, this.yPosition, {
        align: "center",
      });
      this.yPosition += 10;

      // Date Range
      const periodText = `Periode: ${
        dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : ""
      } s/d ${dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : ""}`;
      this.doc.text(periodText, 105, this.yPosition, { align: "center" });
      this.yPosition += 5;

      // Line separator
      this.doc.setLineWidth(0.5);
      this.doc.line(20, this.yPosition, 190, this.yPosition);
      this.yPosition += 15;
    } catch (error) {
      console.error("Error adding header:", error);
      throw error;
    }
  }

  private addSalesSection(reportData: ReportData): void {
    try {
      this.checkPageBreak(50);

      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("PENJUALAN PERIODE", 20, this.yPosition);
      this.yPosition += 10;

      const salesSummary = [
        ["Penjualan Rupiah", formatCurrency(reportData.salesData.rupiah)],
        ["Jumlah Kilo", `${reportData.salesData.kilo.toFixed(1)} kg`],
        ["Jumlah Satuan", `${reportData.salesData.satuan} pcs`],
      ];

      autoTable(this.doc, {
        startY: this.yPosition,
        head: [["Kategori", "Nilai"]],
        body: salesSummary,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 },
      });

      this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    } catch (error) {
      console.error("Error adding sales section:", error);
      throw error;
    }
  }

  private addPaymentSection(reportData: ReportData): void {
    try {
      this.checkPageBreak(80);

      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("CARA BAYAR", 20, this.yPosition);
      this.yPosition += 10;

      const paymentData = [
        [
          "Cash",
          reportData.paymentBreakdown.cash.transactions.toString(),
          formatCurrency(reportData.paymentBreakdown.cash.amount),
        ],
        [
          "Transfer",
          reportData.paymentBreakdown.transfer.transactions.toString(),
          formatCurrency(reportData.paymentBreakdown.transfer.amount),
        ],
        [
          "QRIS",
          reportData.paymentBreakdown.qris.transactions.toString(),
          formatCurrency(reportData.paymentBreakdown.qris.amount),
        ],
        [
          "Deposit",
          reportData.paymentBreakdown.deposit.transactions.toString(),
          formatCurrency(reportData.paymentBreakdown.deposit.amount),
        ],
        ["", "", ""],
        ["Pengeluaran", "", formatCurrency(reportData.expenses)],
        ["Nett Cash", "", formatCurrency(reportData.netCash)],
      ];

      autoTable(this.doc, {
        startY: this.yPosition,
        head: [["Cara Bayar", "#Transaksi", "Nominal"]],
        body: paymentData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 },
      });

      this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    } catch (error) {
      console.error("Error adding payment section:", error);
      throw error;
    }
  }

  private addTransactionSection(reportData: ReportData): void {
    try {
      this.checkPageBreak(60);

      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("JUMLAH TRANSAKSI", 20, this.yPosition);
      this.yPosition += 10;

      const transactionSummary = [
        ["#Transaksi Kilo", reportData.transactionCounts.kilo.toString()],
        ["#Transaksi Satuan", reportData.transactionCounts.satuan.toString()],
        [
          "Total Transaksi",
          (
            reportData.transactionCounts.kilo +
            reportData.transactionCounts.satuan
          ).toString(),
        ],
      ];

      autoTable(this.doc, {
        startY: this.yPosition,
        head: [["Jenis", "Jumlah"]],
        body: transactionSummary,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 },
      });

      this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    } catch (error) {
      console.error("Error adding transaction section:", error);
      throw error;
    }
  }

  private addDepositSection(reportData: ReportData): void {
    try {
      this.checkPageBreak(60);

      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("DEPOSIT", 20, this.yPosition);
      this.yPosition += 10;

      const depositSummary = [
        [
          "Top Up Deposit",
          reportData.depositData.topUp.transactions.toString(),
          formatCurrency(reportData.depositData.topUp.amount),
        ],
        [
          "Transaksi Deposit",
          reportData.depositData.usage.transactions.toString(),
          formatCurrency(reportData.depositData.usage.amount),
        ],
      ];

      autoTable(this.doc, {
        startY: this.yPosition,
        head: [["Jenis", "#Transaksi", "Nominal"]],
        body: depositSummary,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 },
      });

      this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    } catch (error) {
      console.error("Error adding deposit section:", error);
      throw error;
    }
  }

  private addCustomerSection(reportData: ReportData): void {
    try {
      this.checkPageBreak(60);

      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("TRANSAKSI CUSTOMER", 20, this.yPosition);
      this.yPosition += 10;

      const customerSummary = [
        ["Customer Baru", reportData.customerData.new.toString()],
        ["Customer Lama", reportData.customerData.existing.toString()],
        [
          "Total Customer",
          (
            reportData.customerData.new + reportData.customerData.existing
          ).toString(),
        ],
      ];

      autoTable(this.doc, {
        startY: this.yPosition,
        head: [["Jenis Customer", "Jumlah Transaksi"]],
        body: customerSummary,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 },
      });

      this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    } catch (error) {
      console.error("Error adding customer section:", error);
      throw error;
    }
  }

  private addServiceBreakdownSection(reportData: ReportData): void {
    try {
      // New page for service breakdown
      this.doc.addPage();
      this.yPosition = 20;

      // Kiloan Regular
      this.doc.setFontSize(16);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("LAPORAN JENIS CUCIAN", 105, this.yPosition, {
        align: "center",
      });
      this.yPosition += 15;

      this.doc.setFontSize(14);
      this.doc.text("KILOAN REGULAR", 20, this.yPosition);
      this.yPosition += 10;

      const kiloRegularData = reportData.serviceBreakdown.kiloan.regular.map(
        (service) => [
          service.service,
          service.kilo.toFixed(1),
          formatCurrency(service.amount),
        ]
      );

      // Add totals row
      const regularTotalKilo =
        reportData.serviceBreakdown.kiloan.regular.reduce(
          (sum, s) => sum + s.kilo,
          0
        );
      const regularTotalAmount =
        reportData.serviceBreakdown.kiloan.regular.reduce(
          (sum, s) => sum + s.amount,
          0
        );
      kiloRegularData.push([
        "TOTAL",
        regularTotalKilo.toFixed(1),
        formatCurrency(regularTotalAmount),
      ]);

      autoTable(this.doc, {
        startY: this.yPosition,
        head: [["Jenis Layanan", "Total Kilo", "Nominal"]],
        body: kiloRegularData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 },
      });

      this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;

      // Kiloan Express
      this.checkPageBreak(80);
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("KILOAN EXPRESS", 20, this.yPosition);
      this.yPosition += 10;

      const kiloExpressData = reportData.serviceBreakdown.kiloan.express.map(
        (service) => [
          service.service,
          service.kilo.toFixed(1),
          formatCurrency(service.amount),
        ]
      );

      // Add totals row
      const expressTotalKilo =
        reportData.serviceBreakdown.kiloan.express.reduce(
          (sum, s) => sum + s.kilo,
          0
        );
      const expressTotalAmount =
        reportData.serviceBreakdown.kiloan.express.reduce(
          (sum, s) => sum + s.amount,
          0
        );
      kiloExpressData.push([
        "TOTAL",
        expressTotalKilo.toFixed(1),
        formatCurrency(expressTotalAmount),
      ]);

      autoTable(this.doc, {
        startY: this.yPosition,
        head: [["Jenis Layanan", "Total Kilo", "Nominal"]],
        body: kiloExpressData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 },
      });

      this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;

      // Satuan
      this.checkPageBreak(80);
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("SATUAN", 20, this.yPosition);
      this.yPosition += 10;

      const satuanData = reportData.serviceBreakdown.satuan.map((item) => [
        item.item,
        item.count.toString(),
        formatCurrency(item.amount),
      ]);

      // Add totals row
      const satuanTotalCount = reportData.serviceBreakdown.satuan.reduce(
        (sum, s) => sum + s.count,
        0
      );
      const satuanTotalAmount = reportData.serviceBreakdown.satuan.reduce(
        (sum, s) => sum + s.amount,
        0
      );
      satuanData.push([
        "TOTAL",
        satuanTotalCount.toString(),
        formatCurrency(satuanTotalAmount),
      ]);

      autoTable(this.doc, {
        startY: this.yPosition,
        head: [["Jenis Barang", "Total Barang", "Nominal"]],
        body: satuanData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 },
      });
    } catch (error) {
      console.error("Error adding service breakdown section:", error);
      throw error;
    }
  }

  private addFooter(): void {
    try {
      const pageCount = this.doc.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        this.doc.setPage(i);

        // Footer line
        this.doc.setLineWidth(0.3);
        this.doc.line(20, 280, 190, 280);

        // Footer text
        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(
          `Generated on: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
          20,
          285
        );
        this.doc.text(`Page ${i} of ${pageCount}`, 190, 285, {
          align: "right",
        });
        this.doc.text("Sistem Manajemen Laundry", 105, 285, {
          align: "center",
        });
      }
    } catch (error) {
      console.error("Error adding footer:", error);
      throw error;
    }
  }

  public generatePDF(
    reportData: ReportData,
    dateRange: DateRange | undefined
  ): void {
    try {
      console.log("Starting PDF generation...");

      // Add all sections
      this.addHeader(dateRange);
      console.log("Header added");

      this.addSalesSection(reportData);
      console.log("Sales section added");

      this.addPaymentSection(reportData);
      console.log("Payment section added");

      this.addTransactionSection(reportData);
      console.log("Transaction section added");

      this.addDepositSection(reportData);
      console.log("Deposit section added");

      this.addCustomerSection(reportData);
      console.log("Customer section added");

      this.addServiceBreakdownSection(reportData);
      console.log("Service breakdown added");

      this.addFooter();
      console.log("Footer added");

      // Generate filename
      const fileName = `laporan_laundry_${format(
        dateRange?.from || new Date(),
        "ddMMyyyy"
      )}_${format(dateRange?.to || new Date(), "ddMMyyyy")}.pdf`;

      // Save PDF
      this.doc.save(fileName);
      console.log("PDF saved successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error(
        `Failed to generate PDF report: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  public getPDFBlob(
    reportData: ReportData,
    dateRange: DateRange | undefined
  ): Blob {
    try {
      // Add all sections
      this.addHeader(dateRange);
      this.addSalesSection(reportData);
      this.addPaymentSection(reportData);
      this.addTransactionSection(reportData);
      this.addDepositSection(reportData);
      this.addCustomerSection(reportData);
      this.addServiceBreakdownSection(reportData);
      this.addFooter();

      // Return as blob
      return this.doc.output("blob");
    } catch (error) {
      console.error("Error generating PDF blob:", error);
      throw new Error(
        `Failed to generate PDF blob: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Utility function for easy use
export const generateLaundryReport = (
  reportData: ReportData,
  dateRange: DateRange | undefined
): void => {
  try {
    const generator = new LaundryPDFGenerator();
    generator.generatePDF(reportData, dateRange);
  } catch (error) {
    console.error("Error in generateLaundryReport:", error);
    throw error;
  }
};

export const getLaundryReportBlob = (
  reportData: ReportData,
  dateRange: DateRange | undefined
): Blob => {
  try {
    const generator = new LaundryPDFGenerator();
    return generator.getPDFBlob(reportData, dateRange);
  } catch (error) {
    console.error("Error in getLaundryReportBlob:", error);
    throw error;
  }
};
