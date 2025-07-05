"use client";

import { ExpenseExport } from "@/components/expense-export";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable } from "@/components/expense-table";
import { useBranch } from "@/contexts/branch-context";
import api from "@/lib/config/axios";
import { useEffect, useState } from "react";

export default function ExpensesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expenses, setExpenses] = useState([]);

  const { currentBranchId } = useBranch();

  const handleExpenseAdded = async () => {
    setRefreshTrigger((prev) => prev + 1);

    try {
      const response = await api.get(
        `/api/expenses?branch_id=${currentBranchId}`
      );

      if (response.status === 200) {
        setExpenses(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch expenses for export:", error);
    }
  };

  useEffect(() => {
    handleExpenseAdded();
  }, [currentBranchId]);

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

      <ExpenseTable refreshTrigger={refreshTrigger} />
    </div>
  );
}
