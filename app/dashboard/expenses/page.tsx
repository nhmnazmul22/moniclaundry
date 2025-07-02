"use client";

import { ExpenseExport } from "@/components/expense-export";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable } from "@/components/expense-table";
import { useEffect, useState } from "react";

export default function ExpensesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expenses, setExpenses] = useState([]);

  // You can get this from your auth context or props
  const currentBranchId = "your-branch-id-here";

  const handleExpenseAdded = async () => {
    setRefreshTrigger((prev) => prev + 1);
    // Fetch expenses for export component
    try {
      const response = await fetch("/api/expenses");
      const result = await response.json();
      if (response.ok) {
        setExpenses(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch expenses for export:", error);
    }
  };

  useEffect(() => {
    handleExpenseAdded();
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Expense Management</h1>
        <p className="text-muted-foreground">
          Track and manage your daily expenses
        </p>
      </div>

      <ExpenseForm
        onExpenseAdded={handleExpenseAdded}
        currentBranchId={currentBranchId}
      />

      <ExpenseExport expenses={expenses} />

      <ExpenseTable refreshTrigger={refreshTrigger} />
    </div>
  );
}
