"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download, FileSpreadsheet } from "lucide-react";
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
  expenses: Expense[] | any;
  startDate: string;
  endDate: string;
}

export function ExpenseExport({
  expenses,
  startDate,
  endDate,
}: ExpenseExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const filterExpensesByDate = () => {
    if (startDate && endDate) {
      return expenses;
    }

    return expenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

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

      worksheet.columns = [
        { header: "Tanggal (otomatis harian)", key: "date", width: 25 },
        { header: "Jenis Pengeluaran", key: "category", width: 30 },
        { header: "Rp", key: "amount", width: 15 },
      ];

      // Style header row
      const headerRow = worksheet.getRow(1);
      for (let col = 1; col <= 3; col++) {
        const cell = headerRow.getCell(col);
        cell.font = { bold: true, color: { argb: "000000" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }

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

      // Group expenses by date
      const expensesByDate: Record<string, typeof filteredExpenses> = {};
      filteredExpenses.forEach((expense: any) => {
        const date = formatDate(expense.date || expense.createdAt); // format to "DD/MM/YYYY"
        if (!expensesByDate[date]) expensesByDate[date] = [];
        expensesByDate[date].push(expense);
      });

      let grandTotal = 0;

      for (const date of Object.keys(expensesByDate).sort()) {
        const expenses = expensesByDate[date];

        const usedCategories = new Set<string>();
        let dailyTotal = 0;

        // Insert used expenses
        expenses.forEach((exp: any) => {
          usedCategories.add(exp.category);
          worksheet
            .addRow({
              date: date,
              category: exp.category,
              amount: exp.amount,
            })
            .getCell(3).numFmt = "#,##0";
          dailyTotal += exp.amount;
        });

        // Insert unused categories with empty values
        allCategories.forEach((category) => {
          if (!usedCategories.has(category)) {
            worksheet.addRow({
              date: "",
              category,
              amount: "",
            });
          }
        });

        grandTotal += dailyTotal;
      }

      // Add final TOTAL row
      worksheet.addRow({});
      const totalRow = worksheet.addRow({
        category: "TOTAL",
        amount: grandTotal,
      });
      totalRow.font = { bold: true };
      totalRow.getCell(3).numFmt = "#,##0";
      totalRow.getCell(3).alignment = { horizontal: "right" };
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F2F2F2" },
      };

      // Add borders to all data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Export
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const today = new Date().toISOString().split("T")[0];
      saveAs(blob, `Laporan_Pengeluaran_${today}.xlsx`);

      toast({
        title: "Export Berhasil",
        description: `File Laporan_Pengeluaran_${today}.xlsx telah diunduh.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Export Gagal",
        description: "Gagal melakukan export data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-5 w-5" />
          Expense Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={exportToExcel}
          disabled={isExporting}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : `Export Laporan`}
        </Button>
      </CardContent>
    </Card>
  );
}
