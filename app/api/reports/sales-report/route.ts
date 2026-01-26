import { dbConnect } from "@/lib/config/db";
import CustomerModel from "@/lib/models/CustomersModel";
import ExpenseModel from "@/lib/models/ExpnesesModel";
import OrderItemModel from "@/lib/models/OrderItemsModel";
import OrderModel from "@/lib/models/OrdersModel";
import PaymentModel from "@/lib/models/PaymentsModel";
import TransactionModel from "@/lib/models/TransactionModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branch_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const branchFilter = branchId ? { current_branch_id: branchId } : {};

    const orders = await OrderModel.find({ ...dateFilter, ...branchFilter });
    const payments = await PaymentModel.find({
      ...dateFilter,
      ...branchFilter,
    });
    const expenses = await ExpenseModel.find({
      ...dateFilter,
      ...branchFilter,
    });
    const customers = await CustomerModel.find({ ...branchFilter });
    const transactions = await TransactionModel.find({
      ...dateFilter,
      ...branchFilter,
    });

    // Total Revenue & Orders
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    // Payment Breakdown
    const paymentBreakdown = {
      cash: { transactions: 0, amount: 0 },
      transfer: { transactions: 0, amount: 0 },
      qris: { transactions: 0, amount: 0 },
      deposit: { transactions: 0, amount: 0 },
    };

    payments.forEach((p) => {
      if (paymentBreakdown[p.payment_method as keyof typeof paymentBreakdown]) {
        paymentBreakdown[
          p.payment_method as keyof typeof paymentBreakdown
        ].transactions += 1;
        paymentBreakdown[
          p.payment_method as keyof typeof paymentBreakdown
        ].amount += p.amount;
      }
    });

    // Sales Data
    const salesData = {
      rupiah: totalRevenue,
      kilo: orders.reduce((sum, o) => sum + (o.total_weight || 0), 0),
      satuan: orders.reduce((sum, o) => sum + (o.total_unit || 0), 0),
    };

    // Expenses & Net Cash
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netCash = totalRevenue - totalExpenses;

    // Transaction Counts
    const transactionCounts = {
      kilo: orders.reduce((sum, o) => sum + (o.total_weight || 0), 0),
      satuan: orders.reduce((sum, o) => sum + (o.total_unit || 0), 0),
    };

    // Deposit Data
    const depositData = {
      topUp: {
        transactions: transactions.filter((t) => t.type === "deposit_purchase")
          .length,
        amount: transactions
          .filter((t) => t.type === "deposit_purchase")
          .reduce((sum, t) => sum + t.amount, 0),
      },
      usage: {
        transactions: transactions.filter(
          (t) => t.type === "laundry" && t.payment_method === "deposit"
        ).length,
        amount: transactions
          .filter((t) => t.type === "laundry" && t.payment_method === "deposit")
          .reduce((sum, t) => sum + (t.deposit_amount || 0), 0),
      },
    };

    // Customer Data
    const newCustomerCount = startDate
      ? customers.filter(
          (c: any) => new Date(c.createdAt) >= new Date(startDate)
        ).length
      : 0;

    const customerData = {
      new: newCustomerCount,
      existing: customers.length - newCustomerCount,
    };

    // Daily Breakdown
    const dailyMap: { [key: string]: { revenue: number; orders: number } } = {};
    orders.forEach((order: any) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];
      if (!dailyMap[date]) dailyMap[date] = { revenue: 0, orders: 0 };
      dailyMap[date].revenue += order.total_amount;
      dailyMap[date].orders += 1;
    });

    const dailyBreakdown = Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
        avgPerOrder: data.orders ? data.revenue / data.orders : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // ----------------- SERVICE BREAKDOWN -----------------
    const branchMatch = branchId
      ? {
          $match: {
            current_branch_id: new mongoose.Types.ObjectId(branchId),
          },
        }
      : null;

    const kiloanRegular = await OrderItemModel.aggregate([
      ...(startDate && endDate
        ? [
            {
              $match: {
                createdAt: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: "services",
          localField: "service_id",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      { $unwind: "$serviceDetails" },
      {
        $addFields: {
          typeLower: { $toLower: "$serviceDetails.type" },
        },
      },
      {
        $match: {
          typeLower: "kiloan",
        },
      },
      ...(branchMatch ? [branchMatch] : []),
      {
        $group: {
          _id: "$serviceDetails.servicename",
          kilo: { $sum: "$quantity" },
          amount: { $sum: "$subtotal" },
        },
      },
      {
        $project: {
          service: "$_id",
          kilo: 1,
          amount: 1,
          _id: 0,
        },
      },
    ]);

    const kiloanExpress = await OrderItemModel.aggregate([
      ...(startDate && endDate
        ? [
            {
              $match: {
                createdAt: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: "services",
          localField: "service_id",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      { $unwind: "$serviceDetails" },
      {
        $addFields: {
          typeLower: { $toLower: "$serviceDetails.type" },
          groupLower: { $toLower: "$serviceDetails.group" },
        },
      },
      {
        $match: {
          typeLower: "kiloan",
          groupLower: "express",
        },
      },
      ...(branchMatch ? [branchMatch] : []),
      {
        $group: {
          _id: "$serviceDetails.servicename",
          kilo: { $sum: "$quantity" },
          amount: { $sum: "$subtotal" },
        },
      },
      {
        $project: {
          service: "$_id",
          kilo: 1,
          amount: 1,
          _id: 0,
        },
      },
    ]);

    const satuan = await OrderItemModel.aggregate([
      ...(startDate && endDate
        ? [
            {
              $match: {
                createdAt: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: "services",
          localField: "service_id",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      { $unwind: "$serviceDetails" },
      {
        $addFields: {
          typeLower: { $toLower: "$serviceDetails.type" },
        },
      },
      {
        $match: {
          typeLower: "satuan",
        },
      },
      ...(branchMatch ? [branchMatch] : []),
      {
        $group: {
          _id: "$serviceDetails.servicename",
          count: { $sum: "$quantity" },
          amount: { $sum: "$subtotal" },
        },
      },
      {
        $project: {
          item: "$_id",
          count: 1,
          amount: 1,
          _id: 0,
        },
      },
    ]);

    const reportData = {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      dailyBreakdown,
      paymentBreakdown,
      salesData,
      expenses: {
        total: totalExpenses,
        transaction: expenses.length,
      },
      netCash,
      transactionCounts,
      depositData,
      customerData,
      serviceBreakdown: {
        kiloan: {
          regular: kiloanRegular,
          express: kiloanExpress,
        },
        satuan,
      },
    };

    return NextResponse.json({ status: "Successful", data: reportData });
  } catch (err: any) {
    console.error("[REPORT_API_ERROR]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
