import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { EnhancedReportData } from "./report-data-enhanced";

export const generateProfessionalCSV = (data: EnhancedReportData) => {
  const dateFrom = format(data.dateRange.from, "dd/MM/yyyy", { locale: id });
  const dateTo = format(data.dateRange.to, "dd/MM/yyyy", { locale: id });

  // Create structured CSV with proper spacing and alignment
  const csvRows: string[] = [];

  // Header with proper spacing
  csvRows.push("=== LAPORAN JUAL CUCI ===");
  csvRows.push("");
  csvRows.push("Periode: " + dateFrom + " sampai " + dateTo);
  csvRows.push("");
  csvRows.push("=".repeat(120)); // Separator line
  csvRows.push("");

  // Column headers with proper spacing
  csvRows.push(
    "PENJUALAN HARI INI,,,,PENJUALAN BULAN INI,,,,PENJUALAN PERIODE,,"
  );
  csvRows.push("=".repeat(40) + ",," + "=".repeat(40) + ",," + "=".repeat(40));
  csvRows.push("");

  // Sales Data Section with better formatting
  csvRows.push("RINGKASAN PENJUALAN:");
  csvRows.push(
    "Kategori,Nilai,Satuan,Kategori,Nilai,Satuan,Kategori,Nilai,Satuan"
  );
  csvRows.push(
    `Rupiah,${data.salesData.rupiah.toLocaleString(
      "id-ID"
    )},IDR,Rupiah,${data.salesData.rupiah.toLocaleString(
      "id-ID"
    )},IDR,Rupiah,${data.salesData.rupiah.toLocaleString("id-ID")},IDR`
  );
  csvRows.push(
    `Jumlah Kilo,${data.salesData.kilo.toFixed(
      1
    )},kg,Jumlah Kilo,${data.salesData.kilo.toFixed(
      1
    )},kg,Jumlah Kilo,${data.salesData.kilo.toFixed(1)},kg`
  );
  csvRows.push(
    `Jumlah Satuan,${data.salesData.satuan},pcs,Jumlah Satuan,${data.salesData.satuan},pcs,Jumlah Satuan,${data.salesData.satuan},pcs`
  );
  csvRows.push("");

  // Payment Methods with better structure
  csvRows.push("METODE PEMBAYARAN:");
  csvRows.push(
    "Metode,Transaksi,Nominal (IDR),Metode,Transaksi,Nominal (IDR),Metode,Transaksi,Nominal (IDR)"
  );
  csvRows.push("-".repeat(120));

  const paymentMethods = [
    { name: "Cash", data: data.paymentMethods.cash },
    { name: "Transfer Bank", data: data.paymentMethods.transfer },
    { name: "QRIS", data: data.paymentMethods.qris },
    { name: "Deposit", data: data.paymentMethods.deposit },
  ];

  paymentMethods.forEach((payment) => {
    csvRows.push(
      `${payment.name},${
        payment.data.transactions
      },${payment.data.nominal.toLocaleString("id-ID")},${payment.name},${
        payment.data.transactions
      },${payment.data.nominal.toLocaleString("id-ID")},${payment.name},${
        payment.data.transactions
      },${payment.data.nominal.toLocaleString("id-ID")}`
    );
  });
  csvRows.push("");

  // Financial Summary
  csvRows.push("RINGKASAN KEUANGAN:");
  csvRows.push("Item,Nilai (IDR),Item,Nilai (IDR),Item,Nilai (IDR)");
  csvRows.push("-".repeat(80));
  csvRows.push(`Piutang,0,Piutang,0,Piutang,0`);
  csvRows.push(
    `Pengeluaran,${data.pengeluaran.toLocaleString(
      "id-ID"
    )},Pengeluaran,${data.pengeluaran.toLocaleString(
      "id-ID"
    )},Pengeluaran,${data.pengeluaran.toLocaleString("id-ID")}`
  );
  csvRows.push(
    `Net Cash,${data.netCash.toLocaleString(
      "id-ID"
    )},Net Cash,${data.netCash.toLocaleString(
      "id-ID"
    )},Net Cash,${data.netCash.toLocaleString("id-ID")}`
  );
  csvRows.push("");
  csvRows.push("CATATAN: Net Cash = Cash - Pengeluaran");
  csvRows.push("");

  // Transaction Analysis
  csvRows.push("ANALISIS TRANSAKSI:");
  csvRows.push("Jenis,Jumlah,Jenis,Jumlah,Jenis,Jumlah");
  csvRows.push("-".repeat(60));
  csvRows.push(
    `Transaksi Kilo,${data.transactionCount.kilo},Transaksi Kilo,${data.transactionCount.kilo},Transaksi Kilo,${data.transactionCount.kilo}`
  );
  csvRows.push(
    `Transaksi Satuan,${data.transactionCount.satuan},Transaksi Satuan,${data.transactionCount.satuan},Transaksi Satuan,${data.transactionCount.satuan}`
  );
  csvRows.push("");

  // Deposit Analysis
  csvRows.push("ANALISIS DEPOSIT:");
  csvRows.push(
    "Jenis Deposit,Transaksi,Nominal (IDR),Jenis Deposit,Transaksi,Nominal (IDR),Jenis Deposit,Transaksi,Nominal (IDR)"
  );
  csvRows.push("-".repeat(120));
  csvRows.push(
    `Top Up Deposit,${
      data.depositDetails.topUpDeposit.transactions
    },${data.depositDetails.topUpDeposit.nominal.toLocaleString(
      "id-ID"
    )},Top Up Deposit,${
      data.depositDetails.topUpDeposit.transactions
    },${data.depositDetails.topUpDeposit.nominal.toLocaleString(
      "id-ID"
    )},Top Up Deposit,${
      data.depositDetails.topUpDeposit.transactions
    },${data.depositDetails.topUpDeposit.nominal.toLocaleString("id-ID")}`
  );
  csvRows.push(
    `Transaksi Deposit,${
      data.depositDetails.transactionDeposit.transactions
    },${data.depositDetails.transactionDeposit.nominal.toLocaleString(
      "id-ID"
    )},Transaksi Deposit,${
      data.depositDetails.transactionDeposit.transactions
    },${data.depositDetails.transactionDeposit.nominal.toLocaleString(
      "id-ID"
    )},Transaksi Deposit,${
      data.depositDetails.transactionDeposit.transactions
    },${data.depositDetails.transactionDeposit.nominal.toLocaleString("id-ID")}`
  );
  csvRows.push("");

  // Customer Analysis
  csvRows.push("ANALISIS CUSTOMER:");
  csvRows.push(
    "Jenis Customer,Jumlah,Jenis Customer,Jumlah,Jenis Customer,Jumlah"
  );
  csvRows.push("-".repeat(80));
  csvRows.push(
    `Customer Baru,${data.customerTransactions.new},Customer Baru,${data.customerTransactions.new},Customer Baru,${data.customerTransactions.new}`
  );
  csvRows.push(
    `Customer Lama,${data.customerTransactions.old},Customer Lama,${data.customerTransactions.old},Customer Lama,${data.customerTransactions.old}`
  );
  csvRows.push("");

  // Service Categories
  csvRows.push("KATEGORI LAYANAN:");
  csvRows.push(
    "Layanan,Berat (kg),Harga/kg,Total,Layanan,Berat (kg),Harga/kg,Total,Layanan,Berat (kg),Harga/kg,Total"
  );
  csvRows.push("-".repeat(120));
  csvRows.push(
    `Regular,${data.serviceCategories.regular.kilo.toFixed(
      1
    )},${data.serviceCategories.regular.price.toLocaleString(
      "id-ID"
    )},${data.serviceCategories.regular.total.toLocaleString(
      "id-ID"
    )},Regular,${data.serviceCategories.regular.kilo.toFixed(
      1
    )},${data.serviceCategories.regular.price.toLocaleString(
      "id-ID"
    )},${data.serviceCategories.regular.total.toLocaleString(
      "id-ID"
    )},Regular,${data.serviceCategories.regular.kilo.toFixed(
      1
    )},${data.serviceCategories.regular.price.toLocaleString(
      "id-ID"
    )},${data.serviceCategories.regular.total.toLocaleString("id-ID")}`
  );
  csvRows.push(
    `Express,${data.serviceCategories.express.kilo.toFixed(
      1
    )},${data.serviceCategories.express.price.toLocaleString(
      "id-ID"
    )},${data.serviceCategories.express.total.toLocaleString(
      "id-ID"
    )},Express,${data.serviceCategories.express.kilo.toFixed(
      1
    )},${data.serviceCategories.express.price.toLocaleString(
      "id-ID"
    )},${data.serviceCategories.express.total.toLocaleString(
      "id-ID"
    )},Express,${data.serviceCategories.express.kilo.toFixed(
      1
    )},${data.serviceCategories.express.price.toLocaleString(
      "id-ID"
    )},${data.serviceCategories.express.total.toLocaleString("id-ID")}`
  );
  csvRows.push("");

  // Footer
  csvRows.push("=".repeat(120));
  csvRows.push("Laporan dibuat pada: " + new Date().toLocaleString("id-ID"));
  csvRows.push("Sistem Laporan Laundry - Professional Format");
  csvRows.push("=".repeat(120));

  return csvRows.join("\n");
};

export const generateDetailedServiceCSV = (data: EnhancedReportData) => {
  const dateFrom = format(data.dateRange.from, "dd/MM/yyyy", { locale: id });
  const dateTo = format(data.dateRange.to, "dd/MM/yyyy", { locale: id });

  const csvRows: string[] = [];

  // Professional header
  csvRows.push("=== LAPORAN DETAIL KATEGORI LAYANAN ===");
  csvRows.push("");
  csvRows.push("Periode: " + dateFrom + " sampai " + dateTo);
  csvRows.push("");
  csvRows.push("=".repeat(150));
  csvRows.push("");

  // Column headers
  csvRows.push(
    "PENJUALAN HARI INI,,,,,,,PENJUALAN BULAN INI,,,,,,,PENJUALAN PERIODE,,,,,"
  );
  csvRows.push(
    "Kategori Group Layi | Jenis Layanan,,,,,,,Kategori Group Layi | Jenis Layanan,,,,,,,Kategori Group Layi | Jenis Layanan,,,,"
  );
  csvRows.push("");

  // Service table headers
  csvRows.push(
    "Kategori,Total Kilo,Harga,Nominal,Jenis Layanan,Total Kilo,Nominal,Kategori,Total Kilo,Harga,Nominal,Jenis Layanan,Total Kilo,Nominal,Kategori,Total Kilo,Harga,Nominal,Jenis Layanan,Total Kilo,Nominal"
  );
  csvRows.push("-".repeat(200));

  // Service data with professional formatting
  const serviceData = [
    {
      category: "KILOAN",
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

  serviceData.forEach((item) => {
    csvRows.push(
      `${item.category},${item.kilo},${item.price.toLocaleString(
        "id-ID"
      )},${item.total.toLocaleString("id-ID")},${item.type},${
        item.kilo
      },${item.total.toLocaleString("id-ID")},${item.category},${
        item.kilo
      },${item.price.toLocaleString("id-ID")},${item.total.toLocaleString(
        "id-ID"
      )},${item.type},${item.kilo},${item.total.toLocaleString("id-ID")},${
        item.category
      },${item.kilo},${item.price.toLocaleString(
        "id-ID"
      )},${item.total.toLocaleString("id-ID")},${item.type},${
        item.kilo
      },${item.total.toLocaleString("id-ID")}`
    );
  });

  csvRows.push("");
  csvRows.push("EXPRESS SERVICES:");
  csvRows.push("-".repeat(100));
  csvRows.push(
    `Express,${data.serviceCategories.express.kilo.toFixed(
      1
    )},160400,,Jenis Layanan,Total Kilo,Nominal,Express,${data.serviceCategories.express.kilo.toFixed(
      1
    )},160400,,Jenis Layanan,Total Kilo,Nominal,Express,${data.serviceCategories.express.kilo.toFixed(
      1
    )},160400,,Jenis Layanan,Total Kilo,Nominal`
  );

  const expressServices = [
    { name: "Cuci Kering Santis", kilo: 6, total: 45000 },
    { name: "Cuci Kering Lipat < 5kg", kilo: 4.3, total: 34400 },
    { name: "Cuci Kering Lipat min 5kg", kilo: 3, total: 21000 },
    { name: "Cuci Kering Santis Baju Bayi", kilo: 5, total: 30000 },
  ];

  expressServices.forEach((service) => {
    csvRows.push(
      `,,,,${service.name},${service.kilo},${service.total.toLocaleString(
        "id-ID"
      )},,,,${service.name},${service.kilo},${service.total.toLocaleString(
        "id-ID"
      )},,,,${service.name},${service.kilo},${service.total.toLocaleString(
        "id-ID"
      )}`
    );
  });

  csvRows.push("");
  csvRows.push("KATEGORI/GROUP BARANG:");
  csvRows.push("-".repeat(120));
  csvRows.push(
    "Kategori,Total Barang,Nominal,Jenis Barang,Total Barang,Nominal,Kategori,Total Barang,Nominal,Jenis Barang,Total Barang,Nominal,Kategori,Total Barang,Nominal,Jenis Barang,Total Barang,Nominal"
  );

  const categoryItems = [
    { category: "SELIMUT", item: "Bed Cover 200 cm", qty: 10, price: 350000 },
    { category: "", item: "Bed Cover 160 cm", qty: 4, price: 250000 },
    { category: "", item: "Bed Cover Max 160 cm", qty: 2, price: 50000 },
    { category: "SEPATU", item: "Sepatu Boots", qty: 15, price: 150000 },
    { category: "", item: "Sepatu Flat/Teplek", qty: 2, price: 40000 },
    {
      category: "",
      item: "Sepatu Kulit/Sneaker/Premium",
      qty: 1,
      price: 60000,
    },
  ];

  categoryItems.forEach((item) => {
    csvRows.push(
      `${item.category},${item.qty},${item.price.toLocaleString("id-ID")},${
        item.item
      },${item.qty},${item.price.toLocaleString("id-ID")},${item.category},${
        item.qty
      },${item.price.toLocaleString("id-ID")},${item.item},${
        item.qty
      },${item.price.toLocaleString("id-ID")},${item.category},${
        item.qty
      },${item.price.toLocaleString("id-ID")},${item.item},${
        item.qty
      },${item.price.toLocaleString("id-ID")}`
    );
  });

  csvRows.push("");
  csvRows.push("=".repeat(150));
  csvRows.push("CATATAN:");
  csvRows.push("- Dihancurkan jumlah kilogram dan nominal nilai transaksinya");
  csvRows.push("- Dihancurkan jumlah total barangnya");
  csvRows.push("");
  csvRows.push("Laporan dibuat pada: " + new Date().toLocaleString("id-ID"));
  csvRows.push("=".repeat(150));

  return csvRows.join("\n");
};

export const downloadCSV = (csvContent: string, filename: string) => {
  // Add BOM for proper Excel UTF-8 support
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csvContent;

  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
