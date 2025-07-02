import { dbConnect } from "@/lib/config/db";
import CustomerModel from "@/lib/models/CustomersModel";
import ExpenseModel from "@/lib/models/ExpnesesModel";
import OrderModel from "@/lib/models/OrdersModel";
import TransactionModel from "@/lib/models/TransactionModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const branchId = searchParams.get("branch_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const matchBranch: any = {};
    if (branchId)
      matchBranch.current_branch_id = new mongoose.Types.ObjectId(branchId);

    // ✅ Build date filter
    const dateFilter: any = {};
    if (startDate) {
      const from = new Date(startDate);
      from.setHours(0, 0, 0, 0);
      dateFilter.$gte = from;
    }
    if (endDate) {
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      dateFilter.$lte = to;
    }

    const dateMatch =
      Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // 🔢 Orders (for Sales & Laundry Data)
    const orders = await OrderModel.find({
      ...matchBranch,
      ...dateMatch,
    }).lean();

    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const paidAmount = orders
      .filter((o) => o.payment_status === "lunas")
      .reduce((sum, o) => sum + o.total_amount, 0);
    const outstandingAmount = totalRevenue - paidAmount;
    const totalKg = orders.reduce((sum, o) => sum + o.total_weight, 0);
    const totalUnits = orders.length;

    // 💸 Expenses
    const expensesData = await ExpenseModel.find({
      ...matchBranch,
      ...dateMatch,
    }).lean();
    const expenses = expensesData.reduce((sum, e) => sum + e.amount, 0);
    const netCash = paidAmount - expenses;

    // 💳 Transactions
    const transactions = await TransactionModel.find({
      ...matchBranch,
      status: "completed",
      ...dateMatch,
    }).lean();

    const transactionData = {
      totalTransactions: transactions.length,
      paymentMethods: ["cash", "qris", "transfer", "deposit"].map((method) => {
        const filtered = transactions.filter(
          (t) => t.payment_method === method
        );
        return {
          type: method.charAt(0).toUpperCase() + method.slice(1),
          count: filtered.length,
          amount: filtered.reduce((sum, t) => sum + t.amount, 0),
        };
      }),
      regularTransactions: transactions.filter((t) => t.type === "laundry")
        .length,
      cancelledTransactions: await TransactionModel.countDocuments({
        ...matchBranch,
        status: "cancelled",
        ...dateMatch,
      }),
    };

    // 🏦 Deposit Data
    const depositTransactions = transactions.filter(
      (t) => t.type === "deposit_purchase"
    );
    const topUpUsers = new Set(depositTransactions.map((t) => t.customer_id));
    const depositData = {
      topUpCount: depositTransactions.length,
      topUpUsers: topUpUsers.size,
      totalTopUpValue: depositTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      ),
    };

    // 👥 Customers
    const allCustomers = await CustomerModel.find({ ...matchBranch }).lean();
    const existingCustomers = allCustomers.length;

    const newCustomers = allCustomers.filter((c: any) => {
      const created = new Date(c.createdAt);
      if (dateFilter.$gte && created < dateFilter.$gte) return false;
      if (dateFilter.$lte && created > dateFilter.$lte) return false;
      return true;
    }).length;

    return NextResponse.json({
      salesData: {
        totalRevenue,
        paidAmount,
        outstandingAmount,
        expenses,
        netCash,
      },
      laundryData: {
        totalKg,
        totalUnits,
      },
      transactionData,
      depositData,
      customerData: {
        existingCustomers,
        newCustomers,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard summary",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
