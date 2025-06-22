import * as XLSX from "xlsx"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { EnhancedReportData } from "./report-data-enhanced"

export const generateProfessionalExcel = (data: EnhancedReportData) => {
  const dateFrom = format(data.dateRange.from, "dd/MM/yyyy", { locale: id })
  const dateTo = format(data.dateRange.to, "dd/MM/yyyy", { locale: id })

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Create worksheet data for Format 1 (Standard Report)
  const ws1Data = [
    ["LAPORAN JUAL CUCI", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    [
      "Penjualan Hari ini",
      "",
      "",
      "Penjualan Bulan ini",
      "",
      "",
      `Penjualan Periode (${dateFrom} s/d ${dateTo})`,
      "",
      "",
    ],
    ["", "", "", "", "", "", "", "", ""],

    // Sales Data Section
    ["Rupiah", data.salesData.rupiah, "", "Rupiah", data.salesData.rupiah, "", "Rupiah", data.salesData.rupiah, ""],
    [
      "Jumlah Kilo",
      data.salesData.kilo.toFixed(1),
      "",
      "Jumlah Kilo",
      data.salesData.kilo.toFixed(1),
      "",
      "Jumlah Kilo",
      data.salesData.kilo.toFixed(1),
      "",
    ],
    [
      "Jumlah Satuan",
      data.salesData.satuan,
      "",
      "Jumlah Satuan",
      data.salesData.satuan,
      "",
      "Jumlah Satuan",
      data.salesData.satuan,
      "",
    ],
    ["", "", "", "", "", "", "", "", ""],

    // Formulas
    ["Formulas:", "", "", "Formulas:", "", "", "Formulas:", "", ""],
    ["Penjualan Rupiah", "", "", "Penjualan Rupiah", "", "", "Penjualan Rupiah", "", ""],
    ["Penjualan Kilo", "", "", "Penjualan Kilo", "", "", "Penjualan Kilo", "", ""],
    ["Penjualan Satuan", "", "", "Penjualan Satuan", "", "", "Penjualan Satuan", "", ""],
    ["", "", "", "", "", "", "", "", ""],

    // Payment Methods
    [
      "Cara Bayar",
      "#Transaksi",
      "Nominal",
      "Cara Bayar",
      "#Transaksi",
      "Nominal",
      "Cara Bayar",
      "#Transaksi",
      "Nominal",
    ],
    [
      "Cash",
      data.paymentMethods.cash.transactions,
      data.paymentMethods.cash.nominal,
      "Cash",
      data.paymentMethods.cash.transactions,
      data.paymentMethods.cash.nominal,
      "Cash",
      data.paymentMethods.cash.transactions,
      data.paymentMethods.cash.nominal,
    ],
    [
      "Transfer",
      data.paymentMethods.transfer.transactions,
      data.paymentMethods.transfer.nominal,
      "Transfer",
      data.paymentMethods.transfer.transactions,
      data.paymentMethods.transfer.nominal,
      "Transfer",
      data.paymentMethods.transfer.transactions,
      data.paymentMethods.transfer.nominal,
    ],
    [
      "QRIS",
      data.paymentMethods.qris.transactions,
      data.paymentMethods.qris.nominal,
      "QRIS",
      data.paymentMethods.qris.transactions,
      data.paymentMethods.qris.nominal,
      "QRIS",
      data.paymentMethods.qris.transactions,
      data.paymentMethods.qris.nominal,
    ],
    [
      "Deposit",
      data.paymentMethods.deposit.transactions,
      data.paymentMethods.deposit.nominal,
      "Deposit",
      data.paymentMethods.deposit.transactions,
      data.paymentMethods.deposit.nominal,
      "Deposit",
      data.paymentMethods.deposit.transactions,
      data.paymentMethods.deposit.nominal,
    ],
    ["", "", "", "", "", "", "", "", ""],

    // Piutang
    ["Piutang", "#Transaksi", "Nominal", "Piutang", "#Transaksi", "Nominal", "Piutang", "#Transaksi", "Nominal"],
    ["", 0, 0, "", 0, 0, "", 0, 0],
    ["", "", "", "", "", "", "", "", ""],

    // Pengeluaran
    ["Pengeluaran", data.pengeluaran, "", "Pengeluaran", data.pengeluaran, "", "Pengeluaran", data.pengeluaran, ""],
    ["", "", "", "", "", "", "", "", ""],

    // Net Cash
    ["Nett Cash", data.netCash, "", "Nett Cash", data.netCash, "", "Nett Cash", data.netCash, ""],
    [
      "(formasi : cash - pengeluaran)",
      "",
      "",
      "(formasi : cash - pengeluaran)",
      "",
      "",
      "(formasi : cash - pengeluaran)",
      "",
      "",
    ],
    ["", "", "", "", "", "", "", "", ""],

    // Transaction Count
    ["Jumlah Transaksi", "", "", "Jumlah Transaksi", "", "", "Jumlah Transaksi", "", ""],
    [
      "(formasi : berdasarkan jumlah nota",
      "",
      "",
      "(formasi : berdasarkan jumlah nota",
      "",
      "",
      "(formasi : berdasarkan jumlah nota",
      "",
      "",
    ],
    [
      "yang dibuat sesuai jenis kategori cuci)",
      "",
      "",
      "yang dibuat sesuai jenis kategori cuci)",
      "",
      "",
      "yang dibuat sesuai jenis kategori cuci)",
      "",
      "",
    ],
    [
      "#Transaksi Kilo",
      "#Transaksi Satuan",
      "",
      "#Transaksi Kilo",
      "#Transaksi Satuan",
      "",
      "#Transaksi Kilo",
      "#Transaksi Satuan",
      "",
    ],
    [
      data.transactionCount.kilo,
      data.transactionCount.satuan,
      "",
      data.transactionCount.kilo,
      data.transactionCount.satuan,
      "",
      data.transactionCount.kilo,
      data.transactionCount.satuan,
      "",
    ],
    ["", "", "", "", "", "", "", "", ""],

    // Deposit
    ["Deposit", "#Transaksi", "Nominal", "Deposit", "#Transaksi", "Nominal", "Deposit", "#Transaksi", "Nominal"],
    [
      "Top Up Deposit",
      data.depositDetails.topUpDeposit.transactions,
      data.depositDetails.topUpDeposit.nominal,
      "Top Up Deposit",
      data.depositDetails.topUpDeposit.transactions,
      data.depositDetails.topUpDeposit.nominal,
      "Top Up Deposit",
      data.depositDetails.topUpDeposit.transactions,
      data.depositDetails.topUpDeposit.nominal,
    ],
    [
      "Transaksi Deposit",
      data.depositDetails.transactionDeposit.transactions,
      data.depositDetails.transactionDeposit.nominal,
      "Transaksi Deposit",
      data.depositDetails.transactionDeposit.transactions,
      data.depositDetails.transactionDeposit.nominal,
      "Transaksi Deposit",
      data.depositDetails.transactionDeposit.transactions,
      data.depositDetails.transactionDeposit.nominal,
    ],
    ["", "", "", "", "", "", "", "", ""],

    // Customer Transactions
    ["Baru", "Lama", "", "Baru", "Lama", "", "Baru", "Lama", ""],
    [
      "Transaksi Customer",
      data.customerTransactions.old,
      "",
      "Transaksi Customer",
      data.customerTransactions.old,
      "",
      "Transaksi Customer",
      data.customerTransactions.old,
      "",
    ],
    ["", "", "", "", "", "", "", "", ""],

    // Customer Formulas
    ["Formula:", "", "", "Formula:", "", "", "Formula:", "", ""],
    ["Transaksi Customer Baru", "", "", "Transaksi Customer Baru", "", "", "Transaksi Customer Baru", "", ""],
    [
      "Jumlah transaksi customer yang",
      "",
      "",
      "Jumlah transaksi customer yang",
      "",
      "",
      "Jumlah transaksi customer yang",
      "",
      "",
    ],
    ["baru pertama kali laundry", "", "", "baru pertama kali laundry", "", "", "baru pertama kali laundry", "", ""],
    ["Transaksi Customer Lama", "", "", "Transaksi Customer Lama", "", "", "Transaksi Customer Lama", "", ""],
    [
      "Jumlah transaksi customer yang",
      "",
      "",
      "Jumlah transaksi customer yang",
      "",
      "",
      "Jumlah transaksi customer yang",
      "",
      "",
    ],
    ["sudah pernah laundry", "", "", "sudah pernah laundry", "", "", "sudah pernah laundry", "", ""],
  ]

  // Create worksheet
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data)

  // Set column widths
  ws1["!cols"] = [
    { wch: 25 }, // Column A
    { wch: 15 }, // Column B
    { wch: 15 }, // Column C
    { wch: 25 }, // Column D
    { wch: 15 }, // Column E
    { wch: 15 }, // Column F
    { wch: 30 }, // Column G
    { wch: 15 }, // Column H
    { wch: 15 }, // Column I
  ]

  // Add borders and styling
  const range = XLSX.utils.decode_range(ws1["!ref"] || "A1:I50")

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ c: C, r: R })
      if (!ws1[cell_address]) continue

      // Add borders to all cells
      ws1[cell_address].s = {
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      }

      // Header styling
      if (R === 0) {
        ws1[cell_address].s.font = { bold: true, sz: 14 }
        ws1[cell_address].s.alignment = { horizontal: "center" }
      }

      // Column headers styling
      if (R === 2) {
        ws1[cell_address].s.fill = { fgColor: { rgb: "FFFF00" } } // Yellow background
        ws1[cell_address].s.font = { bold: true }
      }

      // Payment method headers
      if (R === 14 && (C === 0 || C === 3 || C === 6)) {
        ws1[cell_address].s.font = { bold: true }
      }

      // Formula text styling (red)
      if ((R >= 8 && R <= 12) || (R >= 26 && R <= 28) || (R >= 38 && R <= 44)) {
        ws1[cell_address].s.font = { color: { rgb: "FF0000" } }
      }
    }
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws1, "Laporan Standard")

  // Create second worksheet for detailed services
  const ws2Data = [
    [
      "LAPORAN JUAL CUCI - DETAIL KATEGORI",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    [
      "Penjualan Hari ini",
      "",
      "",
      "",
      "",
      "",
      "",
      "Penjualan Bulan ini",
      "",
      "",
      "",
      "",
      "",
      "",
      `Penjualan Periode (${dateFrom} s/d ${dateTo})`,
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "Kategori Group Layi",
      "Jenis Layanan",
      "",
      "",
      "",
      "",
      "",
      "Kategori Group Layi",
      "Jenis Layanan",
      "",
      "",
      "",
      "",
      "",
      "Kategori Group Layi",
      "Jenis Layanan",
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Service table headers
    [
      "Kategori Group Layi",
      "Total Kilo",
      "Harga",
      "Nominal",
      "Jenis Layanan",
      "Total Kilo",
      "Nominal",
      "Kategori Group Layi",
      "Total Kilo",
      "Harga",
      "Nominal",
      "Jenis Layanan",
      "Total Kilo",
      "Nominal",
      "Kategori Group Layi",
      "Total Kilo",
      "Harga",
      "Nominal",
      "Jenis Layanan",
      "Total Kilo",
      "Nominal",
    ],

    // Service data
    [
      "Kiloan",
      100,
      1205000,
      3000,
      "Regular",
      100,
      3000,
      "Kiloan",
      100,
      1205000,
      3000,
      "Regular",
      100,
      3000,
      "Kiloan",
      100,
      1205000,
      3000,
      "Regular",
      100,
      3000,
    ],
    [
      "",
      20,
      160000,
      10000,
      "Santis",
      20,
      10000,
      "",
      20,
      160000,
      10000,
      "Santis",
      20,
      10000,
      "",
      20,
      160000,
      10000,
      "Santis",
      20,
      10000,
    ],
    [
      "",
      5,
      25000,
      40,
      "Cuci Kering Lipat < 5kg",
      5,
      40,
      "",
      5,
      25000,
      40,
      "Cuci Kering Lipat < 5kg",
      5,
      40,
      "",
      5,
      25000,
      40,
      "Cuci Kering Lipat < 5kg",
      5,
      40,
    ],
    [
      "",
      3,
      21000,
      50,
      "Cuci Kering Lipat min 5kg",
      3,
      50,
      "",
      3,
      21000,
      50,
      "Cuci Kering Lipat min 5kg",
      3,
      50,
      "",
      3,
      21000,
      50,
      "Cuci Kering Lipat min 5kg",
      3,
      50,
    ],
    [
      "",
      10,
      100000,
      100,
      "Cuci Kering Santis Baju Bayi",
      10,
      100,
      "",
      10,
      100000,
      100,
      "Cuci Kering Santis Baju Bayi",
      10,
      100,
      "",
      10,
      100000,
      100,
      "Cuci Kering Santis Baju Bayi",
      10,
      100,
    ],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Express section
    [
      "Express",
      data.serviceCategories.express.kilo.toFixed(1),
      160400,
      "",
      "Jenis Layanan",
      "Total Kilo",
      "Nominal",
      "Express",
      data.serviceCategories.express.kilo.toFixed(1),
      160400,
      "",
      "Jenis Layanan",
      "Total Kilo",
      "Nominal",
      "Express",
      data.serviceCategories.express.kilo.toFixed(1),
      160400,
      "",
      "Jenis Layanan",
      "Total Kilo",
      "Nominal",
    ],
    [
      "",
      "",
      "",
      "",
      "Cuci Kering Santis",
      6,
      45000,
      "",
      "",
      "",
      "",
      "Cuci Kering Santis",
      6,
      45000,
      "",
      "",
      "",
      "",
      "Cuci Kering Santis",
      6,
      45000,
    ],
    [
      "",
      "",
      "",
      "",
      "Cuci Kering Lipat < 5kg",
      4.3,
      34400,
      "",
      "",
      "",
      "",
      "Cuci Kering Lipat < 5kg",
      4.3,
      34400,
      "",
      "",
      "",
      "",
      "Cuci Kering Lipat < 5kg",
      4.3,
      34400,
    ],
    [
      "",
      "",
      "",
      "",
      "Cuci Kering Lipat min 5kg",
      3,
      21000,
      "",
      "",
      "",
      "",
      "Cuci Kering Lipat min 5kg",
      3,
      21000,
      "",
      "",
      "",
      "",
      "Cuci Kering Lipat min 5kg",
      3,
      21000,
    ],
    [
      "",
      "",
      "",
      "",
      "Cuci Kering Santis Baju Bayi",
      5,
      30000,
      "",
      "",
      "",
      "",
      "Cuci Kering Santis Baju Bayi",
      5,
      30000,
      "",
      "",
      "",
      "",
      "Cuci Kering Santis Baju Bayi",
      5,
      30000,
    ],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Formulas
    ["Formulas:", "", "", "", "", "", "", "Formulas:", "", "", "", "", "", "", "Formulas:", "", "", "", "", "", ""],
    [
      "Dihancurkan jumlah kilogram",
      "",
      "",
      "",
      "",
      "",
      "",
      "Dihancurkan jumlah kilogram",
      "",
      "",
      "",
      "",
      "",
      "",
      "Dihancurkan jumlah kilogram",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "dan nominal nilai transaksinya",
      "",
      "",
      "",
      "",
      "",
      "",
      "dan nominal nilai transaksinya",
      "",
      "",
      "",
      "",
      "",
      "",
      "dan nominal nilai transaksinya",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Category section
    [
      "Kategori/Group Barang",
      "",
      "",
      "",
      "",
      "",
      "",
      "Kategori/Group Barang",
      "",
      "",
      "",
      "",
      "",
      "",
      "Kategori/Group Barang",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["Formulas:", "", "", "", "", "", "", "Formulas:", "", "", "", "", "", "", "Formulas:", "", "", "", "", "", ""],
    [
      "Dihancurkan jumlah total barangnya",
      "",
      "",
      "",
      "",
      "",
      "",
      "Dihancurkan jumlah total barangnya",
      "",
      "",
      "",
      "",
      "",
      "",
      "Dihancurkan jumlah total barangnya",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Category headers
    [
      "Kategori/Group Barang",
      "Total Barang",
      "Nominal",
      "Jenis Barang",
      "Total Barang",
      "Nominal",
      "",
      "Kategori/Group Barang",
      "Total Barang",
      "Nominal",
      "Jenis Barang",
      "Total Barang",
      "Nominal",
      "",
      "Kategori/Group Barang",
      "Total Barang",
      "Nominal",
      "Jenis Barang",
      "Total Barang",
      "Nominal",
    ],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // CONTOH section
    ["CONTOH", "", "", "", "", "", "", "CONTOH", "", "", "", "", "", "", "CONTOH", "", "", "", "", "", ""],
    [
      "Selimut",
      10,
      350000,
      "Bed Cover 200 cm",
      10,
      350000,
      "",
      "Selimut",
      10,
      350000,
      "Bed Cover 200 cm",
      10,
      350000,
      "",
      "Selimut",
      10,
      350000,
      "Bed Cover 200 cm",
      10,
      350000,
    ],
    [
      "",
      4,
      250000,
      "Bed Cover 160 cm",
      4,
      250000,
      "",
      "",
      4,
      250000,
      "Bed Cover 160 cm",
      4,
      250000,
      "",
      "",
      4,
      250000,
      "Bed Cover 160 cm",
      4,
      250000,
    ],
    [
      "",
      2,
      50000,
      "Bed Cover Max 160 cm",
      2,
      50000,
      "",
      "",
      2,
      50000,
      "Bed Cover Max 160 cm",
      2,
      50000,
      "",
      "",
      2,
      50000,
      "Bed Cover Max 160 cm",
      2,
      50000,
    ],
    [
      "Sepatu",
      15,
      150000,
      "Sepatu Boots",
      15,
      150000,
      "",
      "Sepatu",
      15,
      150000,
      "Sepatu Boots",
      15,
      150000,
      "",
      "Sepatu",
      15,
      150000,
      "Sepatu Boots",
      15,
      150000,
    ],
    [
      "",
      2,
      40000,
      "Sepatu Flat/Teplek",
      2,
      40000,
      "",
      "",
      2,
      40000,
      "Sepatu Flat/Teplek",
      2,
      40000,
      "",
      "",
      2,
      40000,
      "Sepatu Flat/Teplek",
      2,
      40000,
    ],
    [
      "",
      1,
      60000,
      "Sepatu Kulit/Sneaker/Premi",
      1,
      60000,
      "",
      "",
      1,
      60000,
      "Sepatu Kulit/Sneaker/Premi",
      1,
      60000,
      "",
      "",
      1,
      60000,
      "Sepatu Kulit/Sneaker/Premi",
      1,
      60000,
    ],
  ]

  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data)

  // Set column widths for second sheet
  ws2["!cols"] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
  ]

  // Style second worksheet
  const range2 = XLSX.utils.decode_range(ws2["!ref"] || "A1:U35")

  for (let R = range2.s.r; R <= range2.e.r; ++R) {
    for (let C = range2.s.c; C <= range2.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ c: C, r: R })
      if (!ws2[cell_address]) continue

      // Add borders
      ws2[cell_address].s = {
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      }

      // Header styling
      if (R === 0) {
        ws2[cell_address].s.font = { bold: true, sz: 14 }
        ws2[cell_address].s.alignment = { horizontal: "center" }
      }

      // Yellow headers
      if (R === 2 || R === 3) {
        ws2[cell_address].s.fill = { fgColor: { rgb: "FFFF00" } }
        ws2[cell_address].s.font = { bold: true }
      }

      // Table headers
      if (R === 5 || R === 26) {
        ws2[cell_address].s.font = { bold: true }
        ws2[cell_address].s.fill = { fgColor: { rgb: "E6E6E6" } }
      }

      // Formula text (red)
      if ((R >= 18 && R <= 20) || (R >= 23 && R <= 24)) {
        ws2[cell_address].s.font = { color: { rgb: "FF0000" } }
      }

      // CONTOH headers
      if (R === 28) {
        ws2[cell_address].s.font = { bold: true, color: { rgb: "0000FF" } }
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws2, "Detail Kategori")

  return wb
}

export const downloadExcel = (workbook: XLSX.WorkBook, filename: string) => {
  XLSX.writeFile(workbook, filename)
}
