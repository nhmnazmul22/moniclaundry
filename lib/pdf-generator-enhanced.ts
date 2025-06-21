import jsPDF from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export interface EnhancedReportData {
  // Sales Data
  salesData: {
    rupiah: number
    kilo: number
    satuan: number
  }

  // Payment Methods
  paymentMethods: {
    cash: { transactions: number; nominal: number }
    transfer: { transactions: number; nominal: number }
    qris: { transactions: number; nominal: number }
    deposit: { transactions: number; nominal: number }
  }

  // Debt/Credit
  piutang: { transactions: number; nominal: number }

  // Expenses
  pengeluaran: number

  // Net Cash
  netCash: number

  // Transaction Details
  transactionCount: {
    kilo: number
    satuan: number
  }

  // Deposit Details
  depositDetails: {
    topUpDeposit: { transactions: number; nominal: number }
    transactionDeposit: { transactions: number; nominal: number }
  }

  // Customer Transactions
  customerTransactions: {
    new: number
    old: number
  }

  // Service Categories
  serviceCategories: {
    regular: { kilo: number; price: number; total: number }
    express: { kilo: number; price: number; total: number }
    items: Array<{
      name: string
      quantity: number
      price: number
      total: number
    }>
  }

  // Date range
  dateRange: {
    from: Date
    to: Date
  }
}

export const generateEnhancedLaundryReport = async (data: EnhancedReportData) => {
  const doc = new jsPDF("landscape", "mm", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Set proper margins
  const margin = 10
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2

  // Set font
  doc.setFont("helvetica")

  // Helper function to draw bordered box
  const drawBox = (x: number, y: number, width: number, height: number, fill = false) => {
    if (fill) {
      doc.setFillColor(255, 255, 153) // Light yellow
      doc.rect(x, y, width, height, "FD")
    } else {
      doc.rect(x, y, width, height)
    }
  }

  // Helper function to add text safely within bounds
  const addText = (text: string, x: number, y: number, maxWidth?: number) => {
    if (maxWidth) {
      const textWidth = doc.getTextWidth(text)
      if (textWidth > maxWidth) {
        // Split text if too long
        const words = text.split(" ")
        let line = ""
        let lineY = y

        for (const word of words) {
          const testLine = line + word + " "
          if (doc.getTextWidth(testLine) > maxWidth && line !== "") {
            doc.text(line.trim(), x, lineY)
            line = word + " "
            lineY += 4
          } else {
            line = testLine
          }
        }
        if (line.trim()) {
          doc.text(line.trim(), x, lineY)
        }
      } else {
        doc.text(text, x, y)
      }
    } else {
      doc.text(text, x, y)
    }
  }

  // Title
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("LAPORAN JUAL CUCI", pageWidth / 2, margin + 10, { align: "center" })

  // Date range
  doc.setFontSize(10)
  const dateText = `Periode: ${format(data.dateRange.from, "dd MMMM yyyy", { locale: id })} - ${format(data.dateRange.to, "dd MMMM yyyy", { locale: id })}`
  doc.text(dateText, pageWidth / 2, margin + 20, { align: "center" })

  // Column setup - make them narrower to fit better
  const colWidth = (usableWidth - 20) / 3 // Divide available width by 3 columns with some spacing
  const col1X = margin
  const col2X = margin + colWidth + 10
  const col3X = margin + colWidth * 2 + 20
  const startY = margin + 30

  // Column Headers with yellow background
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")

  drawBox(col1X, startY, colWidth, 8, true)
  addText("Penjualan Hari ini", col1X + 2, startY + 5, colWidth - 4)

  drawBox(col2X, startY, colWidth, 8, true)
  addText("Penjualan Bulan ini", col2X + 2, startY + 5, colWidth - 4)

  drawBox(col3X, startY, colWidth, 8, true)
  addText(`Penjualan Periode`, col3X + 2, startY + 5, colWidth - 4)

  let currentY = startY + 12

  // Sales Data Section for each column
  const addSalesSection = (x: number, colW: number) => {
    let y = currentY

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)

    // Rupiah
    addText("Rupiah", x + 1, y + 4)
    drawBox(x + colW * 0.4, y, colW * 0.6, 6)
    addText(data.salesData.rupiah.toLocaleString("id-ID"), x + colW * 0.4 + 2, y + 4, colW * 0.6 - 4)

    y += 8
    // Jumlah Kilo
    addText("Jumlah Kilo", x + 1, y + 4)
    drawBox(x + colW * 0.4, y, colW * 0.6, 6)
    addText(data.salesData.kilo.toFixed(1), x + colW * 0.4 + 2, y + 4)

    y += 8
    // Jumlah Satuan
    addText("Jumlah Satuan", x + 1, y + 4)
    drawBox(x + colW * 0.4, y, colW * 0.6, 6)
    addText(data.salesData.satuan.toString(), x + colW * 0.4 + 2, y + 4)

    y += 12

    // Formulas section in red
    doc.setTextColor(255, 0, 0)
    doc.setFontSize(7)
    addText("Formulas :", x + 1, y)
    addText("Penjualan Rupiah", x + 1, y + 4, colW - 2)
    addText("Penjualan Kilo", x + 1, y + 8, colW - 2)
    addText("Penjualan Satuan", x + 1, y + 12, colW - 2)
    doc.setTextColor(0, 0, 0)

    return y + 18
  }

  // Add sales sections for all three columns
  addSalesSection(col1X, colWidth)
  addSalesSection(col2X, colWidth)
  addSalesSection(col3X, colWidth)

  currentY += 35

  // Payment Methods Section
  const addPaymentSection = (x: number, colW: number) => {
    let y = currentY

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    addText("Cara Bayar", x + 1, y + 4)

    y += 8

    // Headers
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)

    const paymentColW1 = colW * 0.35
    const paymentColW2 = colW * 0.25
    const paymentColW3 = colW * 0.4

    drawBox(x, y, paymentColW1, 5)
    addText("", x + 1, y + 3)
    drawBox(x + paymentColW1, y, paymentColW2, 5)
    addText("#Trans", x + paymentColW1 + 1, y + 3)
    drawBox(x + paymentColW1 + paymentColW2, y, paymentColW3, 5)
    addText("Nominal", x + paymentColW1 + paymentColW2 + 1, y + 3)

    y += 5

    // Payment rows
    const payments = [
      { name: "Cash", data: data.paymentMethods.cash },
      { name: "Transfer", data: data.paymentMethods.transfer },
      { name: "QRIS", data: data.paymentMethods.qris },
      { name: "Deposit", data: data.paymentMethods.deposit },
    ]

    payments.forEach((payment) => {
      drawBox(x, y, paymentColW1, 5)
      addText(payment.name, x + 1, y + 3)
      drawBox(x + paymentColW1, y, paymentColW2, 5)
      addText(payment.data.transactions.toString(), x + paymentColW1 + 1, y + 3)
      drawBox(x + paymentColW1 + paymentColW2, y, paymentColW3, 5)
      addText(
        payment.data.nominal.toLocaleString("id-ID"),
        x + paymentColW1 + paymentColW2 + 1,
        y + 3,
        paymentColW3 - 2,
      )
      y += 5
    })

    return y + 5
  }

  // Add payment sections for all columns
  addPaymentSection(col1X, colWidth)
  addPaymentSection(col2X, colWidth)
  addPaymentSection(col3X, colWidth)

  currentY += 30

  // Piutang section
  const addPiutangSection = (x: number, colW: number) => {
    const y = currentY

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)

    drawBox(x, y, colW, 6)
    addText("Piutang", x + 1, y + 4)

    return y + 8
  }

  addPiutangSection(col1X, colWidth)
  addPiutangSection(col2X, colWidth)
  addPiutangSection(col3X, colWidth)

  currentY += 12

  // Pengeluaran and Net Cash section
  const addExpenseSection = (x: number, colW: number) => {
    let y = currentY

    drawBox(x, y, colW, 6)
    doc.setFontSize(8)
    addText("Pengeluaran", x + 1, y + 4)

    y += 8

    // Net Cash
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 0, 0)
    addText("Nett Cash", x + 1, y + 4)
    addText("(formasi : cash - pengeluaran)", x + 1, y + 8, colW - 2)
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "normal")

    drawBox(x + colW * 0.5, y, colW * 0.5, 6)
    addText(data.netCash.toLocaleString("id-ID"), x + colW * 0.5 + 1, y + 4, colW * 0.5 - 2)

    return y + 15
  }

  addExpenseSection(col1X, colWidth)
  addExpenseSection(col2X, colWidth)
  addExpenseSection(col3X, colWidth)

  currentY += 20

  // Check if we need a new page
  if (currentY > pageHeight - 60) {
    doc.addPage()
    currentY = margin + 20
  }

  // Transaction Count section
  const addTransactionSection = (x: number, colW: number) => {
    let y = currentY

    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 0, 0)
    doc.setFontSize(7)
    addText("Jumlah Transaksi", x + 1, y + 3, colW - 2)
    addText("(formasi : berdasarkan jumlah nota", x + 1, y + 7, colW - 2)
    addText("yang dibuat sesuai jenis kategori cuci)", x + 1, y + 11, colW - 2)
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "normal")

    y += 16

    const halfColW = colW / 2

    drawBox(x, y, halfColW, 6)
    doc.setFontSize(7)
    addText("#Transaksi Kilo", x + 1, y + 4, halfColW - 2)
    drawBox(x + halfColW, y, halfColW, 6)
    addText("#Transaksi Satuan", x + halfColW + 1, y + 4, halfColW - 2)

    y += 6
    drawBox(x, y, halfColW, 6)
    addText(data.transactionCount.kilo.toString(), x + 1, y + 4)
    drawBox(x + halfColW, y, halfColW, 6)
    addText(data.transactionCount.satuan.toString(), x + halfColW + 1, y + 4)

    return y + 10
  }

  addTransactionSection(col1X, colWidth)
  addTransactionSection(col2X, colWidth)
  addTransactionSection(col3X, colWidth)

  currentY += 20

  // Deposit section
  const addDepositSection = (x: number, colW: number) => {
    let y = currentY

    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)

    const depColW1 = colW * 0.4
    const depColW2 = colW * 0.25
    const depColW3 = colW * 0.35

    drawBox(x, y, depColW1, 5)
    addText("Deposit", x + 1, y + 3)
    drawBox(x + depColW1, y, depColW2, 5)
    addText("#Trans", x + depColW1 + 1, y + 3)
    drawBox(x + depColW1 + depColW2, y, depColW3, 5)
    addText("Nominal", x + depColW1 + depColW2 + 1, y + 3)

    y += 5
    drawBox(x, y, depColW1, 5)
    addText("Top Up Deposit", x + 1, y + 3, depColW1 - 2)
    drawBox(x + depColW1, y, depColW2, 5)
    addText(data.depositDetails.topUpDeposit.transactions.toString(), x + depColW1 + 1, y + 3)
    drawBox(x + depColW1 + depColW2, y, depColW3, 5)
    addText(
      data.depositDetails.topUpDeposit.nominal.toLocaleString("id-ID"),
      x + depColW1 + depColW2 + 1,
      y + 3,
      depColW3 - 2,
    )

    y += 5
    drawBox(x, y, depColW1, 5)
    addText("Transaksi Deposit", x + 1, y + 3, depColW1 - 2)
    drawBox(x + depColW1, y, depColW2, 5)
    addText(data.depositDetails.transactionDeposit.transactions.toString(), x + depColW1 + 1, y + 3)
    drawBox(x + depColW1 + depColW2, y, depColW3, 5)
    addText(
      data.depositDetails.transactionDeposit.nominal.toLocaleString("id-ID"),
      x + depColW1 + depColW2 + 1,
      y + 3,
      depColW3 - 2,
    )

    y += 8

    // Formulas
    doc.setTextColor(255, 0, 0)
    doc.setFontSize(6)
    addText("Top Up Deposit", x + 1, y + 2, colW - 2)
    addText("Transaksi Deposit", x + 1, y + 6, colW - 2)
    doc.setTextColor(0, 0, 0)

    return y + 12
  }

  addDepositSection(col1X, colWidth)
  addDepositSection(col2X, colWidth)
  addDepositSection(col3X, colWidth)

  currentY += 25

  // Customer transactions at bottom
  const addCustomerSection = (x: number, colW: number) => {
    let y = currentY

    const halfColW = colW / 2

    drawBox(x, y, halfColW, 6)
    doc.setFontSize(8)
    addText("Baru", x + 1, y + 4)
    drawBox(x + halfColW, y, halfColW, 6)
    addText("Lama", x + halfColW + 1, y + 4)

    y += 6
    drawBox(x, y, halfColW, 6)
    addText("Transaksi Customer", x + 1, y + 4, halfColW - 2)
    drawBox(x + halfColW, y, halfColW, 6)
    addText(data.customerTransactions.old.toString(), x + halfColW + 1, y + 4)

    y += 10

    // Formula
    doc.setTextColor(255, 0, 0)
    doc.setFontSize(6)
    addText("Formula :", x + 1, y)
    addText("Transaksi Customer Baru", x + 1, y + 4, colW - 2)
    addText("Transaksi Customer Lama", x + 1, y + 8, colW - 2)
    doc.setTextColor(0, 0, 0)

    return y + 15
  }

  addCustomerSection(col1X, colWidth)
  addCustomerSection(col2X, colWidth)
  addCustomerSection(col3X, colWidth)

  // Save the PDF
  const fileName = `Laporan_Laundry_${format(data.dateRange.from, "yyyyMMdd")}_${format(data.dateRange.to, "yyyyMMdd")}.pdf`
  doc.save(fileName)
}
