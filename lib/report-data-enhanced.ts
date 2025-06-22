import { isWithinInterval } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { EnhancedReportData } from "./pdf-generator-enhanced";

export class EnhancedReportProcessor {
  static createEnhancedReport(
    ordersData: any[],
    paymentsData: any[],
    dateRange: DateRange | undefined
  ): EnhancedReportData {
    if (!dateRange?.from || !dateRange?.to) {
      throw new Error("Date range is required");
    }

    // Filter data within date range
    const filteredOrders = ordersData.filter((order) => {
      const orderDate = new Date(order.created_at || order.date);
      return isWithinInterval(orderDate, {
        start: dateRange.from!,
        end: dateRange.to!,
      });
    });

    const filteredPayments = paymentsData.filter((payment) => {
      const paymentDate = new Date(payment.created_at || payment.date);
      return isWithinInterval(paymentDate, {
        start: dateRange.from!,
        end: dateRange.to!,
      });
    });

    // Calculate sales data
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
    const totalKilo = filteredOrders.reduce(
      (sum, order) => sum + (order.weight || 0),
      0
    );
    const totalSatuan = filteredOrders.reduce(
      (sum, order) => sum + (order.items || 0),
      0
    );

    // Calculate payment methods
    const paymentMethods = {
      cash: { transactions: 0, nominal: 0 },
      transfer: { transactions: 0, nominal: 0 },
      qris: { transactions: 0, nominal: 0 },
      deposit: { transactions: 0, nominal: 0 },
    };

    filteredPayments.forEach((payment) => {
      const method = payment.method?.toLowerCase() || "cash";
      const amount = payment.amount || 0;

      if (paymentMethods[method as keyof typeof paymentMethods]) {
        paymentMethods[method as keyof typeof paymentMethods].transactions += 1;
        paymentMethods[method as keyof typeof paymentMethods].nominal += amount;
      }
    });

    // Calculate service categories
    const regularOrders = filteredOrders.filter(
      (order) => order.service_type === "regular"
    );
    const expressOrders = filteredOrders.filter(
      (order) => order.service_type === "express"
    );

    const serviceCategories = {
      regular: {
        kilo: regularOrders.reduce(
          (sum, order) => sum + (order.weight || 0),
          0
        ),
        price: 5000, // Default price per kg
        total: regularOrders.reduce(
          (sum, order) => sum + (order.total || 0),
          0
        ),
      },
      express: {
        kilo: expressOrders.reduce(
          (sum, order) => sum + (order.weight || 0),
          0
        ),
        price: 8000, // Default express price per kg
        total: expressOrders.reduce(
          (sum, order) => sum + (order.total || 0),
          0
        ),
      },
      items: [
        {
          name: "Cuci Kering Lipat < 5kg",
          quantity: regularOrders.length,
          price: 5000,
          total: regularOrders.reduce(
            (sum, order) => sum + (order.total || 0),
            0
          ),
        },
        {
          name: "Cuci Kering Lipat min 5kg",
          quantity: expressOrders.length,
          price: 8000,
          total: expressOrders.reduce(
            (sum, order) => sum + (order.total || 0),
            0
          ),
        },
      ],
    };

    // Calculate expenses (mock data - you should get this from your actual expenses data)
    const expenses = totalRevenue * 0.1; // 10% of revenue as expenses
    const netCash = paymentMethods.cash.nominal - expenses;

    // Calculate customer transactions
    const uniqueCustomers = new Set(
      filteredOrders.map((order) => order.customer_id)
    );
    const customerTransactions = {
      new: Math.floor(uniqueCustomers.size * 0.3), // 30% new customers
      old: Math.floor(uniqueCustomers.size * 0.7), // 70% returning customers
    };

    return {
      salesData: {
        rupiah: totalRevenue,
        kilo: totalKilo,
        satuan: totalSatuan,
      },
      paymentMethods,
      piutang: { transactions: 0, nominal: 0 }, // Mock data
      pengeluaran: expenses,
      netCash,
      transactionCount: {
        kilo: regularOrders.length + expressOrders.length,
        satuan: filteredOrders.filter((order) => order.service_type === "items")
          .length,
      },
      depositDetails: {
        topUpDeposit: { transactions: 5, nominal: 500000 }, // Mock data
        transactionDeposit: {
          transactions: paymentMethods.deposit.transactions,
          nominal: paymentMethods.deposit.nominal,
        },
      },
      customerTransactions,
      serviceCategories,
      dateRange: {
        from: dateRange.from,
        to: dateRange.to,
      },
    };
  }
}
export type { EnhancedReportData } from "./pdf-generator-enhanced";
