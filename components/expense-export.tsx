"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";

interface Expense {
  _id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  current_branch_id: string;
  createdAt: string;
}

interface ExpenseExportProps {
  expenses: Expense[];
}

export function ExpenseExport({ expenses }: ExpenseExportProps) {
  const [exportFormat, setExportFormat] = useState("excel");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const filterExpensesByDate = () => {
    if (!dateRange.startDate && !dateRange.endDate) {
      return expenses;
    }

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

      if (start && end) {
        return expenseDate >= start && expenseDate <= end;
      } else if (start) {
        return expenseDate >= start;
      } else if (end) {
        return expenseDate <= end;
      }
      return true;
    });
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const filteredExpenses = filterExpensesByDate();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan Pengeluaran");

      // Add title
      const titleRow = worksheet.addRow(["LAPORAN PENGELUARAN HARIAN"]);
      titleRow.font = { bold: true, size: 16 };
      titleRow.alignment = { horizontal: "center" };
      worksheet.mergeCells("A1:C1");

      // Add date range if filtered
      if (dateRange.startDate || dateRange.endDate) {
        const dateRangeText = `Periode: ${dateRange.startDate || "Awal"} - ${
          dateRange.endDate || "Akhir"
        }`;
        const dateRangeRow = worksheet.addRow([dateRangeText]);
        dateRangeRow.font = { italic: true };
        worksheet.mergeCells("A2:C2");
        worksheet.addRow([]); // Empty row
      } else {
        worksheet.addRow([]); // Empty row
      }

      // Set column headers
      const headerRow = worksheet.addRow([
        "Tanggal (otomatis harian)",
        "Jenis Pengeluaran",
        "Rp",
      ]);

      for (let col = 1; col <= 3; col++) {
        const cell = headerRow.getCell(col);
        cell.font = { bold: true, color: { argb: "000000" } };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      // Set column widths
      worksheet.columns = [{ width: 25 }, { width: 20 }, { width: 15 }];

      // Group expenses by category and sum amounts
      const categoryTotals: { [key: string]: number } = {};
      filteredExpenses.forEach((expense) => {
        if (categoryTotals[expense.category]) {
          categoryTotals[expense.category] += expense.amount;
        } else {
          categoryTotals[expense.category] = expense.amount;
        }
      });

      // All possible categories
      const allCategories = [
        "Aqua",
        "Bensin Kurir",
        "Bensin Mobil",
        "Gas",
        "Kasbon",
        "Kebutuhan Laundry",
        "Lainnya",
        "Lembur",
        "Medis",
        "Traktir Karyawan",
        "Uang Training",
      ];

      // Add rows for each category
      allCategories.forEach((category) => {
        const amount = categoryTotals[category] || "";
        const row = worksheet.addRow(["", category, amount]);

        if (amount) {
          const amountCell = row.getCell(3);
          amountCell.numFmt = "#,##0";
          amountCell.alignment = { horizontal: "right" };
        }
      });

      // Add total row
      const totalAmount = Object.values(categoryTotals).reduce(
        (sum, amount) => sum + amount,
        0
      );
      const totalRow = worksheet.addRow(["", "TOTAL", totalAmount]);
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F2F2F2" },
      };

      const totalAmountCell = totalRow.getCell(3);
      totalAmountCell.numFmt = "#,##0";
      totalAmountCell.alignment = { horizontal: "right" };

      // Add borders to all data cells
      const startRow = dateRange.startDate || dateRange.endDate ? 4 : 3;
      const endRow = worksheet.rowCount;

      for (let i = startRow; i <= endRow; i++) {
        const row = worksheet.getRow(i);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }

      // Generate and save file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const today = new Date().toISOString().split("T")[0];
      const filename = `Laporan_Pengeluaran_${today}.xlsx`;
      saveAs(blob, filename);

      toast({
        title: "Export Successful",
        description: `File ${filename} has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export expense report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const filteredExpenses = filterExpensesByDate();

      // Group expenses by category
      const categoryTotals: { [key: string]: number } = {};
      filteredExpenses.forEach((expense) => {
        if (categoryTotals[expense.category]) {
          categoryTotals[expense.category] += expense.amount;
        } else {
          categoryTotals[expense.category] = expense.amount;
        }
      });

      // Create CSV content
      let csvContent = "Tanggal (otomatis harian),Jenis Pengeluaran,Rp\n";

      const allCategories = [
        "Aqua",
        "Bensin Kurir",
        "Bensin Mobil",
        "Gas",
        "Kasbon",
        "Kebutuhan Laundry",
        "Lainnya",
        "Lembur",
        "Medis",
        "Traktir Karyawan",
        "Uang Training",
      ];

      allCategories.forEach((category) => {
        const amount = categoryTotals[category] || "";
        csvContent += `,${category},${amount}\n`;
      });

      // Add total
      const totalAmount = Object.values(categoryTotals).reduce(
        (sum, amount) => sum + amount,
        0
      );
      csvContent += `,TOTAL,${totalAmount}\n`;
      csvContent += ",,\n";
      csvContent += ",Dibuat drop down list,\n";

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const today = new Date().toISOString().split("T")[0];
      const filename = `Laporan_Pengeluaran_${today}.csv`;
      saveAs(blob, filename);

      toast({
        title: "Export Successful",
        description: `File ${filename} has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (exportFormat === "excel") {
      exportToExcel();
    } else {
      exportToCSV();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Export Expense Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (.xlsx)
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV (.csv)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date (Optional)</Label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
            />
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting
            ? "Exporting..."
            : `Export ${exportFormat.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
}
