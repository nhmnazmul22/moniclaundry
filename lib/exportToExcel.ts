import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface PaymentMethod {
  amount: number;
  transactions: number;
}

interface DepositData {
  topUp: PaymentMethod;
  usage: PaymentMethod;
}

interface CustomerData {
  new: number;
  existing: number;
}

export interface SalesReportData {
  salesData: { rupiah: number; kilo: number; satuan: number };
  paymentBreakdown: Record<string, PaymentMethod>;
  expenses: number;
  netCash: number;
  transactionCounts: { kilo: number; satuan: number };
  depositData: DepositData;
  customerData: CustomerData;
}

export const exportSalesReport = async (data: SalesReportData) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Laporan Penjualan");
  const ws2 = wb.addWorksheet("Laporan Jenis Cucian");

  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: "thin" as ExcelJS.BorderStyle },
    left: { style: "thin" as ExcelJS.BorderStyle },
    bottom: { style: "thin" as ExcelJS.BorderStyle },
    right: { style: "thin" as ExcelJS.BorderStyle },
  };

  const addCell = (
    row: number,
    col: number,
    value: any,
    options: {
      bold?: boolean;
      red?: boolean;
      mergeToCol?: number;
    } = {}
  ) => {
    const cell = ws.getCell(row, col);
    cell.value = value;
    cell.border = borderStyle;
    if (options.bold)
      cell.font = {
        bold: true,
        color: options.red ? { argb: "FF0000" } : undefined,
      };
    if (options.red && !options.bold) cell.font = { color: { argb: "FF0000" } };
    if (options.mergeToCol) {
      ws.mergeCells(row, col, row, options.mergeToCol);
      cell.alignment = { vertical: "middle", horizontal: "left" };
    }
  };

  let row = 1;

  // Title
  addCell(row, 1, "Penjualan Hari ini", { bold: true, mergeToCol: 3 });

  row++;
  addCell(row, 1, "Rupiah");
  addCell(row, 2, data.salesData.rupiah);

  row++;
  addCell(row, 1, "Jumlah Kilo");
  addCell(row, 2, data.salesData.kilo);

  row++;
  addCell(row, 1, "Jumlah Satuan");
  addCell(row, 2, data.salesData.satuan);

  row++;
  addCell(row, 1, "Formula:", { bold: true });
  addCell(row, 2, "Penjualan Rupiah", { red: true });
  addCell(row, 3, "Nilai transaksi nett setelah diskon", { red: true });

  row++;
  addCell(row, 2, "Penjualan Kilo", { red: true });
  addCell(row, 3, "Jumlah kilo hasil transaksi laundry kiloan", { red: true });

  row++;
  addCell(row, 2, "Penjualan Satuan", { red: true });
  addCell(row, 3, "Jumlah satuan hasil dari transaksi laundry satuan", {
    red: true,
  });

  // Payment methods
  row += 2;
  addCell(row, 1, "Cara Bayar", { bold: true });
  addCell(row, 2, "#Transaksi", { bold: true });
  addCell(row, 3, "Nominal", { bold: true });

  const payments = ["cash", "transfer", "qris", "deposit"];
  for (const method of payments) {
    row++;
    addCell(row, 1, method.charAt(0).toUpperCase() + method.slice(1));
    addCell(row, 2, data.paymentBreakdown[method]?.transactions ?? 0);
    addCell(row, 3, data.paymentBreakdown[method]?.amount ?? 0);
  }

  // Expenses & Net cash
  row += 2;
  addCell(row, 1, "Pengeluaran", { bold: true });
  addCell(row, 3, data.expenses);

  row++;
  addCell(row, 1, "Nett Cash", { bold: true });
  addCell(row, 3, data.netCash);
  row++;
  addCell(row, 1, "(formula : cash - pengeluaran)", { red: true });

  // Transactions
  row += 2;
  addCell(row, 1, "Jumlah Transaksi", { bold: true });
  addCell(row, 2, "#Transaksi Kilo", { bold: true });
  addCell(row, 3, "#Transaksi Satuan", { bold: true });

  row++;
  addCell(row, 2, data.transactionCounts.kilo);
  addCell(row, 3, data.transactionCounts.satuan);

  row++;
  addCell(row, 1, "(formula : berdasarkan jumlah nota)", { red: true });

  // Deposit data
  row += 2;
  addCell(row, 1, "Deposit", { bold: true });
  addCell(row, 2, "#Transaksi", { bold: true });
  addCell(row, 3, "Nominal", { bold: true });

  row++;
  addCell(row, 1, "Top Up Deposit");
  addCell(row, 2, data.depositData.topUp.transactions);
  addCell(row, 3, data.depositData.topUp.amount);

  row++;
  addCell(row, 1, "Transaksi Deposit");
  addCell(row, 2, data.depositData.usage.transactions);
  addCell(row, 3, data.depositData.usage.amount);

  row++;
  addCell(row, 1, "Formula :", { bold: true });
  addCell(row, 2, "Top Up Deposit", { red: true });
  addCell(row, 3, "Customer membeli deposit", { red: true });

  row++;
  addCell(row, 2, "Transaksi Deposit", { red: true });
  addCell(row, 3, "Customer bayar pakai deposit", { red: true });

  // Customer data
  row += 2;
  addCell(row, 1, "Transaksi Customer", { bold: true });
  addCell(row, 2, "Baru", { bold: true });
  addCell(row, 3, "Lama", { bold: true });

  row++;
  addCell(row, 2, data.customerData.new);
  addCell(row, 3, data.customerData.existing);

  row++;
  addCell(row, 1, "Formula :", { bold: true });
  addCell(row, 2, "Customer Baru", { red: true });
  addCell(row, 3, "Yang baru pertama kali laundry", { red: true });

  row++;
  addCell(row, 2, "Customer Lama", { red: true });
  addCell(row, 3, "Yang sudah pernah laundry", { red: true });

  // Adjust column width
  ws.columns = [{ width: 20 }, { width: 20 }, { width: 30 }];

  // Save
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "laporan-penjualan.xlsx");
};
