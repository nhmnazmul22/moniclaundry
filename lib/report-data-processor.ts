import { Customer, Expense, Order, Payment } from "@/types";
import { format } from "date-fns";
import type { ReportData } from "./pdf-generator";

export class ReportDataProcessor {
  static processReportData(
    ordersData: Order[],
    paymentsData: Payment[],
    expensesData: Expense[],
    customersData: Customer[],
    dateRange: { from: string; to: string }
  ): ReportData {
    if (!dateRange?.from || !dateRange?.to) {
      throw new Error("Date range is required");
    }

    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999); // include full day

    // Filter by date
    const filteredOrders = ordersData.filter((o) => {
      const orderDate = new Date(o.createdAt!);
      return orderDate >= fromDate && orderDate <= toDate;
    });

    const filteredPayments = paymentsData.filter((p) => {
      const paymentDate = new Date(p.payment_date);
      return (
        p.status === "completed" &&
        paymentDate >= fromDate &&
        paymentDate <= toDate
      );
    });

    const filteredExpenses = expensesData.filter((e) => {
      const expenseDate = new Date(e.createdAt!);
      return expenseDate >= fromDate && expenseDate <= toDate;
    });

    const filteredCustomers = customersData.filter((c) => {
      const createdDate = new Date(c.createdAt);
      return createdDate >= fromDate && createdDate <= toDate;
    });

    // Total revenue
    const totalRevenue = filteredPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const totalExpenses = filteredExpenses.reduce(
      (sum, e) => sum + (e.amount || 0),
      0
    );

    const netCash = totalRevenue - totalExpenses;

    // Customer breakdown
    const customerIdsFromOrders = new Set(
      filteredOrders.map((o) => o.customerDetails?._id)
    );
    const newCustomers = filteredCustomers.filter((c) =>
      customerIdsFromOrders.has(c._id)
    );
    const existingCustomers = Array.from(customerIdsFromOrders).filter(
      (id) => !newCustomers.find((c) => c._id === id)
    );

    const customerData = {
      new: newCustomers.length,
      existing: existingCustomers.length,
    };

    // Payment breakdown
    const getPaymentMethod = (p: Payment) => p.payment_method || "cash";

    const paymentBreakdown = ["cash", "transfer", "qris", "deposit"].reduce(
      (acc, method) => {
        const transactions = filteredPayments.filter(
          (p) => getPaymentMethod(p) === method
        );
        acc[method as keyof typeof acc] = {
          transactions: transactions.length,
          amount: transactions.reduce((sum, p) => sum + (p.amount || 0), 0),
        };
        return acc;
      },
      {
        cash: { transactions: 0, amount: 0 },
        transfer: { transactions: 0, amount: 0 },
        qris: { transactions: 0, amount: 0 },
        deposit: { transactions: 0, amount: 0 },
      }
    );

    // Daily breakdown
    const dailyMap: Record<string, { revenue: number; orders: number }> = {};

    filteredPayments.forEach((p) => {
      const d = format(new Date(p.payment_date), "yyyy-MM-dd");
      if (!dailyMap[d]) dailyMap[d] = { revenue: 0, orders: 0 };
      dailyMap[d].revenue += p.amount || 0;
    });

    filteredOrders.forEach((o) => {
      const d = format(new Date(o.createdAt!), "yyyy-MM-dd");
      if (!dailyMap[d]) dailyMap[d] = { revenue: 0, orders: 0 };
      dailyMap[d].orders += 1;
    });

    const dailyBreakdown = Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        ...data,
        avgPerOrder: data.orders > 0 ? data.revenue / data.orders : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Sales Data (basic)
    const salesData = {
      rupiah: totalRevenue,
      kilo: filteredOrders.reduce((sum, o) => sum + o.total_weight, 0),
      satuan: filteredOrders.reduce((sum, o) => sum + o.total_weight, 0),
    };

    // Mocked deposit (you can replace this)
    const depositData = {
      topUp: {
        transactions: Math.floor(totalOrders * 0.05),
        amount: totalRevenue * 0.05,
      },
      usage: {
        transactions: paymentBreakdown.deposit.transactions,
        amount: paymentBreakdown.deposit.amount,
      },
    };

    const transactionCounts = {
      kilo: totalOrders,
      satuan: totalOrders,
    };

    const serviceBreakdown = {
      kiloan: { regular: [], express: [] },
      satuan: [],
    };

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      dailyBreakdown,
      salesData,
      paymentBreakdown,
      expenses: totalExpenses,
      netCash,
      transactionCounts,
      depositData,
      customerData,
      serviceBreakdown,
    };
  }
}
