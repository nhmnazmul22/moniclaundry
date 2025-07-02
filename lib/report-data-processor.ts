import { Customer, Order, Payment } from "@/types";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { ReportData } from "./pdf-generator";

export class ReportDataProcessor {
  static processReportData(
    ordersData: Order[],
    paymentsData: Payment[],
    customersData: Customer[] = [],
    dateRange: DateRange | undefined
  ): ReportData {
    if (!dateRange?.from || !dateRange?.to) {
      throw new Error("Date range is required");
    }

    // Filter data by date range
    const filteredOrders = ordersData.filter((o) => {
      const orderDate = new Date(o.createdAt!);
      return orderDate >= dateRange.from! && orderDate <= dateRange.to!;
    });

    const filteredPayments = paymentsData.filter((p) => {
      const paymentDate = new Date(p.payment_date);
      return (
        p.status === "completed" &&
        paymentDate >= dateRange.from! &&
        paymentDate <= dateRange.to!
      );
    });

    // Basic calculations
    const totalRevenue = filteredPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Daily breakdown
    const dailyBreakdownMap: {
      [key: string]: { revenue: number; orders: number };
    } = {};

    filteredPayments.forEach((p) => {
      const dateStr = format(new Date(p.payment_date), "yyyy-MM-dd");
      if (!dailyBreakdownMap[dateStr])
        dailyBreakdownMap[dateStr] = { revenue: 0, orders: 0 };
      dailyBreakdownMap[dateStr].revenue += p.amount || 0;
    });

    filteredOrders.forEach((o) => {
      const dateStr = format(new Date(o.createdAt!), "yyyy-MM-dd");
      if (!dailyBreakdownMap[dateStr])
        dailyBreakdownMap[dateStr] = { revenue: 0, orders: 0 };
      dailyBreakdownMap[dateStr].orders++;
    });

    const dailyBreakdown = Object.entries(dailyBreakdownMap)
      .map(([date, data]) => ({
        date,
        ...data,
        avgPerOrder: data.orders > 0 ? data.revenue / data.orders : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate mock data based on actual totals (replace with real logic when you have the data)
    const salesData = {
      rupiah: totalRevenue,
      kilo: Math.floor(totalRevenue / 8000), // Assuming average price per kilo
      satuan: Math.floor(totalOrders * 0.3), // Assuming 30% are satuan orders
    };

    // Payment breakdown - adapt this based on your actual payment method field
    const getPaymentMethod = (payment: Payment): string => {
      return payment.payment_method || payment.payment_method || "cash";
    };

    const paymentBreakdown = {
      cash: {
        transactions: filteredPayments.filter(
          (p) => getPaymentMethod(p) === "cash"
        ).length,
        amount: filteredPayments
          .filter((p) => getPaymentMethod(p) === "cash")
          .reduce((sum, p) => sum + p.amount, 0),
      },
      transfer: {
        transactions: filteredPayments.filter(
          (p) => getPaymentMethod(p) === "transfer"
        ).length,
        amount: filteredPayments
          .filter((p) => getPaymentMethod(p) === "transfer")
          .reduce((sum, p) => sum + p.amount, 0),
      },
      qris: {
        transactions: filteredPayments.filter(
          (p) => getPaymentMethod(p) === "qris"
        ).length,
        amount: filteredPayments
          .filter((p) => getPaymentMethod(p) === "qris")
          .reduce((sum, p) => sum + p.amount, 0),
      },
      deposit: {
        transactions: filteredPayments.filter(
          (p) => getPaymentMethod(p) === "deposit"
        ).length,
        amount: filteredPayments
          .filter((p) => getPaymentMethod(p) === "deposit")
          .reduce((sum, p) => sum + p.amount, 0),
      },
    };

    // Mock expenses calculation (replace with actual logic)
    const expenses = totalRevenue * 0.15;
    const netCash = paymentBreakdown.cash.amount - expenses;

    // Transaction counts (mock data - replace with actual service type logic)
    const transactionCounts = {
      kilo: totalOrders,
      satuan: totalOrders,
    };

    // Deposit data (mock - replace with actual deposit transaction data)
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

    // Customer data (mock - replace with actual customer analysis)
    const customerData = {
      new: Math.floor(totalOrders * 0.3),
      existing: Math.floor(totalOrders * 0.7),
    };

    // Service breakdown (mock data - replace with actual service categorization)
    const serviceBreakdown = {
      kiloan: {
        regular: [
          {
            service: "Cuci Kering Setrika",
            kilo: salesData.kilo * 0.6,
            amount: totalRevenue * 0.4,
          },
          {
            service: "Setrika",
            kilo: salesData.kilo * 0.2,
            amount: totalRevenue * 0.15,
          },
          {
            service: "Cuci Kering Lipat < 5kg",
            kilo: salesData.kilo * 0.1,
            amount: totalRevenue * 0.08,
          },
          {
            service: "Cuci Kering Lipat min 5kg",
            kilo: salesData.kilo * 0.05,
            amount: totalRevenue * 0.05,
          },
          {
            service: "Cuci Kering Setrika Baju Bayi",
            kilo: salesData.kilo * 0.05,
            amount: totalRevenue * 0.07,
          },
        ],
        express: [
          {
            service: "Cuci Kering Setrika",
            kilo: salesData.kilo * 0.1,
            amount: totalRevenue * 0.08,
          },
          {
            service: "Setrika",
            kilo: salesData.kilo * 0.05,
            amount: totalRevenue * 0.04,
          },
          {
            service: "Cuci Kering Lipat < 5kg",
            kilo: salesData.kilo * 0.02,
            amount: totalRevenue * 0.02,
          },
          {
            service: "Cuci Kering Lipat min 5kg",
            kilo: salesData.kilo * 0.02,
            amount: totalRevenue * 0.02,
          },
          {
            service: "Cuci Kering Setrika Baju Bayi",
            kilo: salesData.kilo * 0.01,
            amount: totalRevenue * 0.01,
          },
        ],
      },
      satuan: [
        {
          item: "Bed Cover >200 cm",
          count: salesData.satuan * 0.3,
          amount: totalRevenue * 0.1,
        },
        {
          item: "Bed Cover 180-200 cm",
          count: salesData.satuan * 0.2,
          amount: totalRevenue * 0.08,
        },
        {
          item: "Bed Cover Max 160 cm",
          count: salesData.satuan * 0.1,
          amount: totalRevenue * 0.05,
        },
        {
          item: "Sepatu Boots",
          count: salesData.satuan * 0.05,
          amount: totalRevenue * 0.03,
        },
        {
          item: "Sepatu Dewasa",
          count: salesData.satuan * 0.25,
          amount: totalRevenue * 0.08,
        },
        {
          item: "Sepatu Flat/Teplek",
          count: salesData.satuan * 0.05,
          amount: totalRevenue * 0.02,
        },
        {
          item: "Sepatu Kulit/Suede/Premium",
          count: salesData.satuan * 0.05,
          amount: totalRevenue * 0.04,
        },
      ],
    };

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      dailyBreakdown,
      salesData,
      paymentBreakdown,
      expenses,
      netCash,
      transactionCounts,
      depositData,
      customerData,
      serviceBreakdown,
    };
  }

  // Helper method to adapt your data structure
  static createMockDataFromActual(
    ordersData: Order[],
    paymentsData: Payment[],
    dateRange: DateRange | undefined
  ): ReportData {
    // This method creates realistic mock data based on your actual data
    // You can gradually replace the mock calculations with real ones

    if (!dateRange?.from || !dateRange?.to) {
      throw new Error("Date range is required");
    }

    const filteredOrders = ordersData.filter((o) => {
      const orderDate = new Date(o.createdAt!);
      return orderDate >= dateRange.from! && orderDate <= dateRange.to!;
    });

    const filteredPayments = paymentsData.filter((p) => {
      const paymentDate = new Date(p.payment_date);
      return (
        p.status === "completed" &&
        paymentDate >= dateRange.from! &&
        paymentDate <= dateRange.to!
      );
    });

    const totalRevenue = filteredPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const totalOrders = filteredOrders.length;

    // Return mock data structure that matches your PDF format
    return this.processReportData(ordersData, paymentsData, [], dateRange);
  }
}
