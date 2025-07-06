import { dbConnect } from "@/lib/config/db";
import OrderItemsModel from "@/lib/models/OrderItemsModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const orderItems = await OrderItemsModel.aggregate([
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
        $lookup: {
          from: "customers",
          localField: "order.customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $lookup: {
          from: "services",
          localField: "service_id",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
    ]);

    let totalKilos = 0;
    let totalItems = 0;
    let totalRevenue = 0;
    const transactionSet = new Set<string>();

    const reportData = orderItems.map((item) => {
      const order: any = item.order;
      const service: any = item.service;
      const type = service.type || "Satuan";

      // Count unique transactions
      transactionSet.add(order.order_number);

      // Sum revenue
      totalRevenue += item.subtotal;

      // Sum by type
      if (type === "Kiloan") {
        totalKilos += order.total_weight || 0;
      } else {
        totalItems += item.quantity;
      }

      return {
        tanggalTransaksi: new Date(order.createdAt)?.toLocaleString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        nomorTransaksi: order.order_number,
        namaPelanggan: order.customer?.name || "-",

        // Kilogram Type
        kilogramKategori: type === "Kiloan" ? service.category : "-",
        kilogramJenis: type === "Kiloan" ? service.servicename : "-",
        kilogramTotal: type === "Kiloan" ? order.total_weight : "-",
        kilogramHarga:
          type === "Kiloan"
            ? `Rp. ${item.unit_price?.toLocaleString("id-ID")}`
            : "-",

        // Satuan Type
        sautuanKategori: type === "Satuan" ? service.category : "-",
        sautuanLayanan: type === "Satuan" ? service.servicename : "-",
        sautuanTotal: type === "Satuan" ? item.quantity : "-",
        sautuanHarga:
          type === "Satuan"
            ? `Rp. ${item.subtotal?.toLocaleString("id-ID")}`
            : "-",

        // Meter Type
        meterKategori: type === "Meter" ? service.category : "-",
        meterLayanan: type === "Meter" ? service.servicename : "-",
        meterTotal: type === "Meter" ? item.quantity : "-",
        meterHarga:
          type === "Meter"
            ? `Rp. ${item.subtotal?.toLocaleString("id-ID")}`
            : "-",

        statusPembayaran: (order.payment_status || "-")?.toUpperCase(),
        hargaPenjualan: `Rp. ${order.total_amount?.toLocaleString("id-ID")}`,
        metodePembayaran:
          (order.payment_method || "-").charAt(0).toUpperCase() +
          (order.payment_method || "-").slice(1),
      };
    });

    // Build summary
    const summaryData: [string, string][] = [
      ["List Laporan Transaksi Layanan", ""],
      ["Total Kilos:", `${totalKilos.toFixed(2)} Kg`],
      ["Total Buah:", `${totalItems} Buah`],
      ["Jumlah Transaksi:", `${transactionSet.size} Transaksi`],
      ["Total Pendapatan:", `Rp. ${totalRevenue?.toLocaleString("id-ID")}`],
    ];

    return NextResponse.json(
      {
        success: true,
        summary: summaryData,
        data: reportData,
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
