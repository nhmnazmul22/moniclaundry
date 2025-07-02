import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ReportData } from "./pdf-generator";

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
  salesDataMonth: { rupiah: number; kilo: number; satuan: number };
  salesDataPeriod: { rupiah: number; kilo: number; satuan: number };
  paymentBreakdown: Record<string, PaymentMethod>;
  piutang: { transactions: number; amount: number };
  expenses: number;
  netCash: number;
  transactionCounts: { kilo: number; satuan: number };
  depositData: DepositData;
  customerData: CustomerData;
  reguler: {
    total_kilo: number;
    nominal: number;
    details: { jenis_layanan: string; total_kilo: number; nominal: number }[];
  };
  express: {
    total_kilo: number;
    nominal: number;
    details: { jenis_layanan: string; total_kilo: number; nominal: number }[];
  };
  kiloan_total: {
    total_kilo: number;
    nominal: number;
    details: { jenis_barang: string; total_barang: number; nominal: number }[];
  };
  satuan_total: {
    total_kilo: number;
    nominal: number;
    details: { jenis_barang: string; total_barang: number; nominal: number }[];
  };
}

export const createDummyData = (reportData: ReportData): SalesReportData => {
  const regularTotalKilo = reportData.serviceBreakdown.kiloan.regular.reduce(
    (acc, item) => acc + item.kilo,
    0
  );

  const regularTotalAmount = reportData.serviceBreakdown.kiloan.regular.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  const expressTotalKilo = reportData.serviceBreakdown.kiloan.express.reduce(
    (acc, item) => acc + item.kilo,
    0
  );

  const expressTotalAmount = reportData.serviceBreakdown.kiloan.express.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  const regularData = reportData.serviceBreakdown.kiloan.regular.map(
    (item) => ({
      jenis_layanan: item.service,
      total_kilo: item.kilo,
      nominal: item.amount,
    })
  );

  const expressData = reportData.serviceBreakdown.kiloan.express.map(
    (item) => ({
      jenis_layanan: item.service,
      total_kilo: item.kilo,
      nominal: item.amount,
    })
  );

  const kiloanDetails: any = [];

  reportData.serviceBreakdown.kiloan.regular.map((item) => {
    kiloanDetails.push(item);
  });

  reportData.serviceBreakdown.kiloan.express.map((item) => {
    kiloanDetails.push(item);
  });

  const sautanTotalKilo = reportData.serviceBreakdown.satuan.reduce(
    (acc, item) => acc + item.count,
    0
  );

  const sautanTotalAmount = reportData.serviceBreakdown.satuan.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  const sautanData = reportData.serviceBreakdown.satuan.map((item) => ({
    jenis_barang: item.item,
    total_barang: item.count,
    nominal: item.amount,
  }));

  return {
    salesData: {
      rupiah: Number(reportData.salesData.rupiah),
      kilo: Number(reportData.salesData.kilo),
      satuan: Number(reportData.salesData.satuan),
    },
    salesDataMonth: {
      rupiah: Number(reportData.salesData.rupiah),
      kilo: Number(reportData.salesData.kilo),
      satuan: Number(reportData.salesData.satuan),
    },
    salesDataPeriod: {
      rupiah: Number(reportData.salesData.rupiah),
      kilo: Number(reportData.salesData.kilo),
      satuan: Number(reportData.salesData.satuan),
    },
    paymentBreakdown: {
      cash: {
        transactions: Number(reportData.paymentBreakdown.cash.transactions),
        amount: Number(reportData.paymentBreakdown.cash.amount),
      },
      transfer: {
        transactions: Number(reportData.paymentBreakdown.transfer.transactions),
        amount: Number(reportData.paymentBreakdown.transfer.amount),
      },
      qris: {
        transactions: Number(reportData.paymentBreakdown.qris.transactions),
        amount: Number(reportData.paymentBreakdown.qris.amount),
      },
      deposit: {
        transactions: Number(reportData.paymentBreakdown.deposit.transactions),
        amount: Number(reportData.paymentBreakdown.deposit.amount),
      },
    },
    piutang: { transactions: 3, amount: 150000 },
    expenses: reportData.expenses,
    netCash: reportData.netCash,
    transactionCounts: {
      kilo: reportData.transactionCounts.kilo,
      satuan: reportData.transactionCounts.satuan,
    },
    depositData: {
      topUp: {
        transactions: reportData.depositData.topUp.transactions,
        amount: reportData.depositData.topUp.amount,
      },
      usage: {
        transactions: reportData.depositData.usage.transactions,
        amount: reportData.depositData.usage.amount,
      },
    },
    customerData: {
      new: reportData.customerData.new,
      existing: reportData.customerData.existing,
    },
    reguler: {
      total_kilo: regularTotalKilo,
      nominal: regularTotalAmount,
      details: regularData,
    },
    express: {
      total_kilo: expressTotalKilo,
      nominal: expressTotalAmount,
      details: expressData,
    },
    kiloan_total: {
      total_kilo: regularTotalKilo + expressTotalKilo,
      nominal: regularTotalAmount + expressTotalAmount,
      details: kiloanDetails,
    },
    satuan_total: {
      total_kilo: sautanTotalKilo,
      nominal: sautanTotalAmount,
      details: sautanData,
    },
  };
};

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
    worksheet: ExcelJS.Worksheet,
    row: number,
    col: number,
    value: any,
    options: {
      bold?: boolean;
      red?: boolean;
      mergeToCol?: number;
      alignment?: Partial<ExcelJS.Alignment>;
    } = {}
  ) => {
    const cell = worksheet.getCell(row, col);
    cell.value = value;
    cell.border = borderStyle;
    if (options.bold)
      cell.font = {
        bold: true,
        color: options.red ? { argb: "FF0000" } : undefined,
      };
    if (options.red && !options.bold) cell.font = { color: { argb: "FF0000" } };
    if (options.mergeToCol) {
      worksheet.mergeCells(row, col, row, options.mergeToCol);
      cell.alignment = { vertical: "middle", horizontal: "left" };
    }
    if (options.alignment) {
      cell.alignment = options.alignment;
    }
  };

  // Laporan Penjualan Sheet
  let row = 1;

  // Penjualan Hari ini
  addCell(ws, row, 1, "Penjualan Hari ini", { bold: true, mergeToCol: 3 });

  row++;
  addCell(ws, row, 1, "Rupiah");
  addCell(ws, row, 2, data.salesData.rupiah);

  row++;
  addCell(ws, row, 1, "Jumlah Kilo");
  addCell(ws, row, 2, data.salesData.kilo);

  row++;
  addCell(ws, row, 1, "Jumlah Satuan");
  addCell(ws, row, 2, data.salesData.satuan);

  row++;
  addCell(ws, row, 1, "Formula:", { bold: true });
  addCell(ws, row, 2, "Penjualan Rupiah", { red: true });
  addCell(ws, row, 3, "Nilai transaksi nett setelah diskon", { red: true });

  row++;
  addCell(ws, row, 2, "Penjualan Kilo", { red: true });
  addCell(ws, row, 3, "Jumlah kilo hasil transaksi laundry kiloan", {
    red: true,
  });

  row++;
  addCell(ws, row, 2, "Penjualan Satuan", { red: true });
  addCell(ws, row, 3, "Jumlah satuan hasil dari transaksi laundry satuan", {
    red: true,
  });

  // Penjualan Bulan Ini
  row = 1;
  addCell(ws, row, 5, "Penjualan Bulan Ini", { bold: true, mergeToCol: 7 });

  row++;
  addCell(ws, row, 5, "Rupiah");
  addCell(ws, row, 6, data.salesDataMonth.rupiah);

  row++;
  addCell(ws, row, 5, "Jumlah Kilo");
  addCell(ws, row, 6, data.salesDataMonth.kilo);

  row++;
  addCell(ws, row, 5, "Jumlah Satuan");
  addCell(ws, row, 6, data.salesDataMonth.satuan);

  row++;
  addCell(ws, row, 5, "Formula:", { bold: true });
  addCell(ws, row, 6, "Penjualan Rupiah", { red: true });
  addCell(ws, row, 7, "Nilai transaksi nett setelah diskon", { red: true });

  row++;
  addCell(ws, row, 6, "Penjualan Kilo", { red: true });
  addCell(ws, row, 7, "Jumlah kilo hasil transaksi laundry kiloan", {
    red: true,
  });

  row++;
  addCell(ws, row, 6, "Penjualan Satuan", { red: true });
  addCell(ws, row, 7, "Jumlah satuan hasil dari transaksi laundry satuan", {
    red: true,
  });

  // Penjualan Periode
  row = 1;
  addCell(ws, row, 9, "Penjualan Periode (ddmmyyyy s/d ddmmyyyy)", {
    bold: true,
    mergeToCol: 11,
  });

  row++;
  addCell(ws, row, 9, "Rupiah");
  addCell(ws, row, 10, data.salesDataPeriod.rupiah);

  row++;
  addCell(ws, row, 9, "Jumlah Kilo");
  addCell(ws, row, 10, data.salesDataPeriod.kilo);

  row++;
  addCell(ws, row, 9, "Jumlah Satuan");
  addCell(ws, row, 10, data.salesDataPeriod.satuan);

  row++;
  addCell(ws, row, 9, "Formula:", { bold: true });
  addCell(ws, row, 10, "Penjualan Rupiah", { red: true });
  addCell(ws, row, 11, "Nilai transaksi nett setelah diskon", { red: true });

  row++;
  addCell(ws, row, 10, "Penjualan Kilo", { red: true });
  addCell(ws, row, 11, "Jumlah kilo hasil transaksi laundry kiloan", {
    red: true,
  });

  row++;
  addCell(ws, row, 10, "Penjualan Satuan", { red: true });
  addCell(ws, row, 11, "Jumlah satuan hasil dari transaksi laundry satuan", {
    red: true,
  });

  // Payment methods
  const startRowPayment = 9;
  [0, 4, 8].forEach((colOffset) => {
    let currentRow = startRowPayment;
    addCell(ws, currentRow, 1 + colOffset, "Cara Bayar", { bold: true });
    addCell(ws, currentRow, 2 + colOffset, "#Transaksi", { bold: true });
    addCell(ws, currentRow, 3 + colOffset, "Nominal", { bold: true });

    const payments = ["Cash", "Transfer", "QRIS", "Deposit"];
    payments.forEach((method) => {
      currentRow++;
      addCell(ws, currentRow, 1 + colOffset, method);
      addCell(
        ws,
        currentRow,
        2 + colOffset,
        data.paymentBreakdown[method.toLowerCase()]?.transactions ?? 0
      );
      addCell(
        ws,
        currentRow,
        3 + colOffset,
        data.paymentBreakdown[method.toLowerCase()]?.amount ?? 0
      );
    });
  });

  // Piutang
  addCell(ws, startRowPayment + 1, 1, "Piutang", { bold: true });
  addCell(ws, startRowPayment + 1, 2, "#Transaksi", { bold: true });
  addCell(ws, startRowPayment + 1, 3, "Nominal", { bold: true });
  addCell(ws, startRowPayment + 2, 2, data.piutang.transactions);
  addCell(ws, startRowPayment + 2, 3, data.piutang.amount);

  // Expenses & Net cash
  const startRowExpenses = startRowPayment + 7;
  [0, 4, 8].forEach((colOffset) => {
    let currentRow = startRowExpenses;
    addCell(ws, currentRow, 1 + colOffset, "Pengeluaran", { bold: true });
    addCell(ws, currentRow, 3 + colOffset, data.expenses);

    currentRow++;
    addCell(ws, currentRow, 1 + colOffset, "Nett Cash", { bold: true });
    addCell(ws, currentRow, 3 + colOffset, data.netCash);
    currentRow++;
    addCell(ws, currentRow, 1 + colOffset, "(formula : cash - pengeluaran)", {
      red: true,
      mergeToCol: 3 + colOffset,
    });
  });

  // Transactions
  const startRowTransactions = startRowExpenses + 4;
  [0, 4, 8].forEach((colOffset) => {
    let currentRow = startRowTransactions;
    addCell(ws, currentRow, 1 + colOffset, "Jumlah Transaksi", { bold: true });
    addCell(ws, currentRow, 2 + colOffset, "#Transaksi Kilo", { bold: true });
    addCell(ws, currentRow, 3 + colOffset, "#Transaksi Satuan", { bold: true });

    currentRow++;
    addCell(ws, currentRow, 2 + colOffset, data.transactionCounts.kilo);
    addCell(ws, currentRow, 3 + colOffset, data.transactionCounts.satuan);

    currentRow++;
    addCell(
      ws,
      currentRow,
      1 + colOffset,
      "(formula : berdasarkan jumlah nota)",
      { red: true, mergeToCol: 3 + colOffset }
    );
  });

  // Deposit data
  const startRowDeposit = startRowTransactions + 4;
  [0, 4, 8].forEach((colOffset) => {
    let currentRow = startRowDeposit;
    addCell(ws, currentRow, 1 + colOffset, "Deposit", { bold: true });
    addCell(ws, currentRow, 2 + colOffset, "#Transaksi", { bold: true });
    addCell(ws, currentRow, 3 + colOffset, "Nominal", { bold: true });

    currentRow++;
    addCell(ws, currentRow, 1 + colOffset, "Top Up Deposit");
    addCell(ws, currentRow, 2 + colOffset, data.depositData.topUp.transactions);
    addCell(ws, currentRow, 3 + colOffset, data.depositData.topUp.amount);

    currentRow++;
    addCell(ws, currentRow, 1 + colOffset, "Transaksi Deposit");
    addCell(ws, currentRow, 2 + colOffset, data.depositData.usage.transactions);
    addCell(ws, currentRow, 3 + colOffset, data.depositData.usage.amount);

    currentRow++;
    addCell(ws, currentRow, 1 + colOffset, "Formula :", { bold: true });
    addCell(ws, currentRow, 2 + colOffset, "Top Up Deposit", { red: true });
    addCell(ws, currentRow, 3 + colOffset, "Customer membeli deposit", {
      red: true,
    });

    currentRow++;
    addCell(ws, currentRow, 2 + colOffset, "Transaksi Deposit", { red: true });
    addCell(ws, currentRow, 3 + colOffset, "Customer bayar pakai deposit", {
      red: true,
    });
  });

  // Customer data
  const startRowCustomer = startRowDeposit + 6;
  [0, 4, 8].forEach((colOffset) => {
    let currentRow = startRowCustomer;
    addCell(ws, currentRow, 1 + colOffset, "Transaksi Customer", {
      bold: true,
    });
    addCell(ws, currentRow, 2 + colOffset, "Baru", { bold: true });
    addCell(ws, currentRow, 3 + colOffset, "Lama", { bold: true });

    currentRow++;
    addCell(ws, currentRow, 2 + colOffset, data.customerData.new);
    addCell(ws, currentRow, 3 + colOffset, data.customerData.existing);

    currentRow++;
    addCell(ws, currentRow, 1 + colOffset, "Formula :", { bold: true });
    addCell(ws, currentRow, 2 + colOffset, "Customer Baru", { red: true });
    addCell(ws, currentRow, 3 + colOffset, "Yang baru pertama kali laundry", {
      red: true,
    });

    currentRow++;
    addCell(ws, currentRow, 2 + colOffset, "Customer Lama", { red: true });
    addCell(ws, currentRow, 3 + colOffset, "Yang sudah pernah laundry", {
      red: true,
    });
  });

  // Adjust column width for Laporan Penjualan
  ws.columns = [
    { width: 20 },
    { width: 20 },
    { width: 30 }, // A-C
    { width: 5 }, // D (spacer)
    { width: 20 },
    { width: 20 },
    { width: 30 }, // E-G
    { width: 5 }, // H (spacer)
    { width: 20 },
    { width: 20 },
    { width: 30 }, // I-K
  ];

  // Laporan Jenis Cucian Sheet (ws2)
  const addCell2 = (
    worksheet: ExcelJS.Worksheet,
    row: number,
    col: number,
    value: any,
    options: {
      bold?: boolean;
      red?: boolean;
      mergeToCol?: number;
      alignment?: Partial<ExcelJS.Alignment>;
    } = {}
  ) => {
    const cell = worksheet.getCell(row, col);
    cell.value = value;
    cell.border = borderStyle;
    if (options.bold)
      cell.font = {
        bold: true,
        color: options.red ? { argb: "FF0000" } : undefined,
      };
    if (options.red && !options.bold) cell.font = { color: { argb: "FF0000" } };
    if (options.mergeToCol) {
      worksheet.mergeCells(row, col, row, options.mergeToCol);
      cell.alignment = { vertical: "middle", horizontal: "left" };
    }
    if (options.alignment) {
      cell.alignment = options.alignment;
    }
  };

  // Section 1: Penjualan Grup Layanan
  const section1StartCols = [1, 8, 15];
  const section1Titles = [
    "Penjualan Hari ini",
    "Penjualan Bulan Ini",
    "Penjualan Periode (ddmmyyyy s/d ddmmyyyy)",
  ];

  section1StartCols.forEach((startCol, i) => {
    let currentRow = 1;
    addCell2(ws2, currentRow, startCol, section1Titles[i], {
      bold: true,
      mergeToCol: startCol + 2,
    });

    currentRow++;
    addCell2(ws2, currentRow, startCol, "Kategori Grup Layanan", {
      bold: true,
      mergeToCol: startCol + 1,
    });
    addCell2(ws2, currentRow, startCol + 2, "Jenis Layanan", { bold: true });

    currentRow++;
    addCell2(ws2, currentRow, startCol, "Kiloan");
    addCell2(ws2, currentRow, startCol + 1, "Regular");
    addCell2(ws2, currentRow, startCol + 2, "Cuci Kering Setrika");

    currentRow++;
    addCell2(ws2, currentRow, startCol + 1, "Express");
    addCell2(ws2, currentRow, startCol + 2, "Setrika");

    currentRow++;
    addCell2(ws2, currentRow, startCol + 2, "Cuci Kering Lipat < 5kg");

    currentRow++;
    addCell2(ws2, currentRow, startCol + 2, "Cuci Kering Lipat min 5kg");

    currentRow++;
    addCell2(ws2, currentRow, startCol + 2, "Cuci Kering Setrika Baju Bayi");

    currentRow++;
    addCell2(ws2, currentRow, startCol, "Formula:", { bold: true });
    addCell2(
      ws2,
      currentRow,
      startCol + 1,
      "Dijumlahkan jumlah kiloanya saja",
      { red: true, mergeToCol: startCol + 2 }
    );

    currentRow++;
    addCell2(ws2, currentRow, startCol, "CONTOH", { bold: true });

    currentRow++;
    addCell2(ws2, currentRow, startCol, "Kategori Grup Layanan", {
      bold: true,
    });
    addCell2(ws2, currentRow, startCol + 1, "Total Kilo", { bold: true });
    addCell2(ws2, currentRow, startCol + 2, "Nominal", { bold: true });
    addCell2(ws2, currentRow, startCol + 3, "Jenis Layanan", { bold: true });
    addCell2(ws2, currentRow, startCol + 4, "Total Kilo", { bold: true });
    addCell2(ws2, currentRow, startCol + 5, "Nominal", { bold: true });

    // Regular data
    currentRow++;
    addCell2(ws2, currentRow, startCol, "Kiloan");
    addCell2(ws2, currentRow, startCol + 1, "Regular");
    addCell2(ws2, currentRow, startCol + 2, data.reguler.total_kilo);
    addCell2(ws2, currentRow, startCol + 3, data.reguler.nominal);

    let detailRow = currentRow;
    data.reguler.details.forEach((item) => {
      addCell2(ws2, detailRow, startCol + 4, item.jenis_layanan);
      addCell2(ws2, detailRow, startCol + 5, item.total_kilo);
      addCell2(ws2, detailRow, startCol + 6, item.nominal);
      detailRow++;
    });

    // Express data
    currentRow = detailRow + 1; // Adjust row for Express data
    addCell2(ws2, currentRow, startCol + 1, "Express");
    addCell2(ws2, currentRow, startCol + 2, data.express.total_kilo);
    addCell2(ws2, currentRow, startCol + 3, data.express.nominal);

    detailRow = currentRow;
    data.express.details.forEach((item) => {
      addCell2(ws2, detailRow, startCol + 4, item.jenis_layanan);
      addCell2(ws2, detailRow, startCol + 5, item.total_kilo);
      addCell2(ws2, detailRow, startCol + 6, item.nominal);
      detailRow++;
    });
  });

  // Section 2: Kategori Grup Barang
  const section2StartCols = [1, 8, 15];
  const section2Titles = [
    "Kategori Grup Barang",
    "Kategori Grup Barang",
    "Kategori Grup Barang",
  ];

  section2StartCols.forEach((startCol, i) => {
    let currentRow = 25; // Starting row for this section

    addCell2(ws2, currentRow, startCol, section2Titles[i], {
      bold: true,
      mergeToCol: startCol + 2,
    });

    currentRow++;
    addCell2(ws2, currentRow, startCol, "Kategori Grup Barang", { bold: true });
    addCell2(ws2, currentRow, startCol + 1, "Total Barang", { bold: true });
    addCell2(ws2, currentRow, startCol + 2, "Nominal", { bold: true });
    addCell2(ws2, currentRow, startCol + 3, "Jenis Barang", { bold: true });
    addCell2(ws2, currentRow, startCol + 4, "Total Barang", { bold: true });
    addCell2(ws2, currentRow, startCol + 5, "Nominal", { bold: true });

    // Kiloan Total
    currentRow++;
    addCell2(ws2, currentRow, startCol, "Kiloan");
    addCell2(ws2, currentRow, startCol + 1, data.kiloan_total.total_kilo);
    addCell2(ws2, currentRow, startCol + 2, data.kiloan_total.nominal);

    let detailRow = currentRow;
    data.kiloan_total.details.forEach((item) => {
      addCell2(ws2, detailRow, startCol + 3, item.jenis_barang);
      addCell2(ws2, detailRow, startCol + 4, item.total_barang);
      addCell2(ws2, detailRow, startCol + 5, item.nominal);
      detailRow++;
    });

    // Satuan Total
    currentRow = detailRow + 1; // Adjust row for Satuan data
    addCell2(ws2, currentRow, startCol, "Satuan");
    addCell2(ws2, currentRow, startCol + 1, data.satuan_total.total_kilo);
    addCell2(ws2, currentRow, startCol + 2, data.satuan_total.nominal);

    detailRow = currentRow;
    data.satuan_total.details.forEach((item) => {
      addCell2(ws2, detailRow, startCol + 3, item.jenis_barang);
      addCell2(ws2, detailRow, startCol + 4, item.total_barang);
      addCell2(ws2, detailRow, startCol + 5, item.nominal);
      detailRow++;
    });

    currentRow = detailRow + 1;
    addCell2(ws2, currentRow, startCol, "Formula:", { bold: true });
    addCell2(
      ws2,
      currentRow,
      startCol + 1,
      "Dijumlahkan jumlah total barangnya",
      { red: true, mergeToCol: startCol + 5 }
    );

    currentRow++;
    addCell2(ws2, currentRow, startCol, "CONTOH", { bold: true });
  });

  // Adjust column widths for Laporan Jenis Cucian
  ws2.columns = [
    { width: 20 },
    { width: 12 },
    { width: 15 },
    { width: 20 },
    { width: 12 },
    { width: 15 },
    { width: 5 }, // A-G
    { width: 20 },
    { width: 12 },
    { width: 15 },
    { width: 20 },
    { width: 12 },
    { width: 15 },
    { width: 5 }, // H-N
    { width: 20 },
    { width: 12 },
    { width: 15 },
    { width: 20 },
    { width: 12 },
    { width: 15 },
    { width: 5 }, // O-U
  ];

  // Save
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "laporan-penjualan.xlsx");
};


