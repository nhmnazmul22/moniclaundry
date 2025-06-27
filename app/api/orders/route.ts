import { dbConnect } from "@/lib/config/db";
import OrdersModel from "@/lib/models/OrdersModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const orders = await OrdersModel.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $project: {
          customer_id: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    if (orders.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to fetching orders",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: orders,
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
      order_number,
      customer_id,
      total_weight,
      subtotal,
      total_amount,
      payment_method,
      current_branch_id,
    } = body;

    if (
      !order_number ||
      !customer_id ||
      !total_weight ||
      !subtotal ||
      !total_amount ||
      !payment_method ||
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

    // Create new order data
    const order = await OrdersModel.create(body);

    if (!order) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create order",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: order,
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
