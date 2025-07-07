import { dbConnect } from "@/lib/config/db";
import OrderItemsModel from "@/lib/models/OrderItemsModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const branchIdParam = searchParams.get("branch_id");
  const startDateParam = searchParams.get("start_date");
  const endDateParam = searchParams.get("end_date");

  let branchObjectId: mongoose.Types.ObjectId | null = null;
  if (branchIdParam) {
    if (!mongoose.Types.ObjectId.isValid(branchIdParam)) {
      return NextResponse.json(
        { success: false, message: "Invalid branch_id format" },
        { status: 400 }
      );
    }
    branchObjectId = new mongoose.Types.ObjectId(branchIdParam);
  }

  // Parse and validate startDate and endDate
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (startDateParam) {
    const sd = new Date(startDateParam);
    if (isNaN(sd.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid start_date format" },
        { status: 400 }
      );
    }
    startDate = sd;
  }
  if (endDateParam) {
    const ed = new Date(endDateParam);
    if (isNaN(ed.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid end_date format" },
        { status: 400 }
      );
    }
    ed.setHours(23, 59, 59, 999);
    endDate = ed;
  }

  try {
    // Match date range filter for reportData (all other data except chart)
    const matchDateFilter: any = {};
    if (startDate && endDate) {
      matchDateFilter.$gte = startDate;
      matchDateFilter.$lte = endDate;
    } else if (startDate) {
      matchDateFilter.$gte = startDate;
    } else if (endDate) {
      matchDateFilter.$lte = endDate;
    }

    // For chart, always use full year based on startDate year (or current year)
    const chartYear = startDate
      ? startDate.getFullYear()
      : new Date().getFullYear();
    const chartStartDate = new Date(chartYear, 0, 1);
    const chartEndDate = new Date(chartYear, 11, 31, 23, 59, 59, 999);

    // Aggregation pipeline for order items with lookups and date filtering
    const pipeline: any[] = [
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          ...(branchObjectId && { "order.current_branch_id": branchObjectId }),
          ...(Object.keys(matchDateFilter).length > 0 && {
            "order.createdAt": matchDateFilter,
          }),
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "order.customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "services",
          localField: "service_id",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
    ];

    // Fetch all order items matching report date range for reportData
    const orderItems = await OrderItemsModel.aggregate(pipeline);

    // Prepare summary and report data
    let totalKilos = 0;
    let totalItems = 0;
    let totalRevenue = 0;
    const transactionSet = new Set<string>();

    const reportData = orderItems.map((item: any) => {
      const { order, service, customer, quantity, unit_price, subtotal } = item;
      const type: string = service.type || "Satuan";
      const orderDate = new Date(order.createdAt);

      transactionSet.add(order.order_number);
      totalRevenue += subtotal ?? 0;
      if (type === "Kiloan") {
        totalKilos += order.total_weight ?? 0;
      } else if (type === "Satuan") {
        totalItems += quantity ?? 0;
      }

      return {
        tanggalTransaksi: orderDate.toLocaleString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        nomorTransaksi: order.order_number,
        namaPelanggan: customer?.name ?? "-",
        kilogramKategori: type === "Kiloan" ? service.category : "-",
        kilogramJenis: type === "Kiloan" ? service.servicename : "-",
        kilogramTotal: type === "Kiloan" ? order.total_weight : "-",
        kilogramHarga:
          type === "Kiloan"
            ? `Rp. ${Number(unit_price || 0).toLocaleString("id-ID")}`
            : "-",
        satuanKategori: type === "Satuan" ? service.category : "-",
        satuanLayanan: type === "Satuan" ? service.servicename : "-",
        satuanTotal: type === "Satuan" ? quantity : "-",
        satuanHarga:
          type === "Satuan"
            ? `Rp. ${Number(subtotal || 0).toLocaleString("id-ID")}`
            : "-",
        meterKategori: type === "Meter" ? service.category : "-",
        meterLayanan: type === "Meter" ? service.servicename : "-",
        meterTotal: type === "Meter" ? quantity : "-",
        meterHarga:
          type === "Meter"
            ? `Rp. ${Number(subtotal || 0).toLocaleString("id-ID")}`
            : "-",
        statusPembayaran: (order.payment_status ?? "-").toUpperCase(),
        hargaPenjualan: `Rp. ${Number(order.total_amount || 0).toLocaleString(
          "id-ID"
        )}`,
        metodePembayaran: order.payment_method
          ? order.payment_method[0].toUpperCase() +
            order.payment_method.slice(1)
          : "-",
      };
    });

    // Build summary array
    const summaryData: [string, string][] = [
      ["List Laporan Transaksi Layanan", ""],
      ["Total Kilos:", `${totalKilos.toFixed(2)} Kg`],
      ["Total Buah:", `${totalItems} Buah`],
      ["Jumlah Transaksi:", `${transactionSet.size} Transaksi`],
      ["Total Pendapatan:", `Rp. ${totalRevenue.toLocaleString("id-ID")}`],
    ];

    // --- Chart Data ---

    // Build chart data using full year range (Jan-Dec)
    const chartPipeline: any[] = [
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          ...(branchObjectId && { "order.current_branch_id": branchObjectId }),
          "order.createdAt": { $gte: chartStartDate, $lte: chartEndDate },
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service_id",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
    ];

    const chartOrderItems = await OrderItemsModel.aggregate(chartPipeline);

    // Map to aggregate by month label
    const chartMap = new Map<
      string,
      { kilogramTotal: number; satuanTotal: number; meterTotal: number }
    >();

    chartOrderItems.forEach((item: any) => {
      const type = item.service?.type ?? "Satuan";
      const date = new Date(item.order.createdAt);
      const label = date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });

      const current = chartMap.get(label) ?? {
        kilogramTotal: 0,
        satuanTotal: 0,
        meterTotal: 0,
      };

      if (type === "Kiloan") {
        current.kilogramTotal += item.order.total_weight ?? 0;
      } else if (type === "Satuan") {
        current.satuanTotal += item.quantity ?? 0;
      } else if (type === "Meter") {
        current.meterTotal += item.quantity ?? 0;
      }

      chartMap.set(label, current);
    });

    // Fill 12 months with zero if missing
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(chartYear, i, 1);
      return date.toLocaleString("en-US", { month: "short", year: "numeric" });
    });

    const chartData = allMonths.map((label) => ({
      month: label,
      ...(chartMap.get(label) ?? {
        kilogramTotal: 0,
        satuanTotal: 0,
        meterTotal: 0,
      }),
    }));

    return NextResponse.json(
      {
        success: true,
        summary: summaryData,
        data: reportData,
        chartData,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
