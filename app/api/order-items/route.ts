import { dbConnect } from "@/lib/config/db";
import OrderItemsModel from "@/lib/models/OrderItemsModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const orderItems = await OrderItemsModel.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "orderDetails",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service_id",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      {
        $unwind: "$orderDetails",
      },
      {
        $unwind: "$serviceDetails",
      },
      {
        $project: {
          order_id: 0,
          service_id: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    if (orderItems.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Order Items Not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: orderItems,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      order_id,
      service_id,
      quantity,
      unit_price,
      subtotal,
      current_branch_id,
    } = body;

    if (
      !order_id ||
      !service_id ||
      !subtotal ||
      !quantity ||
      !unit_price ||
      !current_branch_id
    ) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // Create new order items data
    const orderItem = await OrderItemsModel.create(body);

    if (!orderItem) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create order item",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: orderItem,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
