"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranch } from "@/contexts/branch-context";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

interface Expense {
  _id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  current_branch_id: string;
  createdAt: string;
}

interface ExpenseTableProps {
  refreshTrigger: number;
}

export function ExpenseTable({ refreshTrigger }: ExpenseTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentBranchId } = useBranch();

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/expenses?branch_id=${currentBranchId}`
      );
      const result = await response.json();

      if (response.ok) {
        setExpenses(result.data || []);
        setError(null);
      } else {
        setError(result.message || "Failed to fetch expenses");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTotalAmount = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Aqua: "bg-blue-100 text-blue-800",
      "Bensin Kurir": "bg-yellow-100 text-yellow-800",
      "Bensin Mobil": "bg-orange-100 text-orange-800",
      Gas: "bg-red-100 text-red-800",
      Kasbon: "bg-purple-100 text-purple-800",
      "Kebutuhan Laundry": "bg-green-100 text-green-800",
      Lainnya: "bg-gray-100 text-gray-800",
      Lembur: "bg-indigo-100 text-indigo-800",
      Medis: "bg-pink-100 text-pink-800",
      "Traktir Karyawan": "bg-cyan-100 text-cyan-800",
      "Uang Training": "bg-emerald-100 text-emerald-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expense Report");

    // Set column widths
    worksheet.columns = [
      { header: "Tanggal (otomatis harian)", key: "date", width: 25 },
      { header: "Jenis Pengeluaran", key: "category", width: 20 },
      { header: "Rp", key: "amount", width: 15 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "366092" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };

    // Add expense data
    expenses.forEach((expense) => {
      const row = worksheet.addRow({
        date: formatDate(expense.date || expense.createdAt),
        category: expense.category,
        amount: expense.amount,
      });

      // Format amount column as currency
      const amountCell = row.getCell(3);
      amountCell.numFmt = "#,##0";
      amountCell.alignment = { horizontal: "right" };
    });

    // Add empty rows to match your image format
    const emptyCategories = [
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

    // Get existing categories from expenses
    const existingCategories = expenses.map((exp) => exp.category);

    // Add empty rows for categories not in expenses
    emptyCategories.forEach((category) => {
      if (!existingCategories.includes(category)) {
        worksheet.addRow({
          date: "",
          category: category,
          amount: "",
        });
      }
    });

    // Add total row
    const totalRow = worksheet.addRow({
      date: "",
      category: "TOTAL",
      amount: getTotalAmount(),
    });

    // Style the total row
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F2F2F2" },
    };

    const totalAmountCell = totalRow.getCell(3);
    totalAmountCell.numFmt = "#,##0";
    totalAmountCell.alignment = { horizontal: "right" };

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Add note about dropdown list
    const noteRow = worksheet.addRow({
      date: "",
      category: "Dibuat drop down list",
      amount: "",
    });
    noteRow.font = { italic: true, color: { argb: "666666" } };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const today = new Date().toISOString().split("T")[0];
    saveAs(blob, `Expense_Report_${today}.xlsx`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Expense Records</span>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            <Badge variant="outline" className="text-lg px-3 py-1">
              Total: {formatCurrency(getTotalAmount())}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No expenses found. Add your first expense above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis Pengeluaran</TableHead>
                  <TableHead className="text-right">Jumlah (Rp)</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell className="font-medium">
                      {formatDate(expense.date || expense.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {expense.description}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={2}>TOTAL</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(getTotalAmount())}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
