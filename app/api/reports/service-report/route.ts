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

  let dateFilter: any = {};
  if (startDateParam) {
    const sd = new Date(startDateParam);
    if (isNaN(sd.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid start_date format" },
        { status: 400 }
      );
    }
    dateFilter.$gte = sd;
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
    dateFilter.$lte = ed;
  }

  try {
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
          ...(Object.keys(dateFilter).length > 0 && {
            "order.createdAt": dateFilter,
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

    const orderItems = await OrderItemsModel.aggregate(pipeline);

    let totalKilos = 0;
    let totalItems = 0;
    let totalRevenue = 0;
    const transactionSet = new Set<string>();

    const reportData = orderItems.map((item: any) => {
      const { order, service, customer, quantity, unit_price, subtotal } = item;
      const type: string = service.type || "Satuan";

      transactionSet.add(order.order_number);
      totalRevenue += subtotal ?? 0;
      if (type === "Kiloan") {
        totalKilos += order.total_weight ?? 0;
      } else {
        totalItems += quantity ?? 0;
      }

      return {
        tanggalTransaksi: order.createdAt
          ? new Date(order.createdAt).toLocaleString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
        nomorTransaksi: order.order_number,
        namaPelanggan: customer?.name ?? "-",

        // Kilogram
        kilogramKategori: type === "Kiloan" ? service.category : "-",
        kilogramJenis: type === "Kiloan" ? service.servicename : "-",
        kilogramTotal: type === "Kiloan" ? order.total_weight : "-",
        kilogramHarga:
          type === "Kiloan"
            ? `Rp. ${Number(unit_price || 0).toLocaleString("id-ID")}`
            : "-",

        // Satuan
        satuanKategori: type === "Satuan" ? service.category : "-",
        satuanLayanan: type === "Satuan" ? service.servicename : "-",
        satuanTotal: type === "Satuan" ? quantity : "-",
        satuanHarga:
          type === "Satuan"
            ? `Rp. ${Number(subtotal || 0).toLocaleString("id-ID")}`
            : "-",

        // Meter
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

    const summaryData: [string, string][] = [
      ["List Laporan Transaksi Layanan", ""],
      ["Total Kilos:", `${totalKilos.toFixed(2)} Kg`],
      ["Total Buah:", `${totalItems} Buah`],
      ["Jumlah Transaksi:", `${transactionSet.size} Transaksi`],
      ["Total Pendapatan:", `Rp. ${totalRevenue.toLocaleString("id-ID")}`],
    ];

    return NextResponse.json(
      { success: true, summary: summaryData, data: reportData },
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
