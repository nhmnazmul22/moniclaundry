import { dbConnect } from "@/lib/config/db";
import OrdersModel from "@/lib/models/OrdersModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get("branch_id");

    const matchStage: any = {};
    if (branch_id) {
      matchStage.current_branch_id = new mongoose.Types.ObjectId(branch_id);
    }

    const orders = await OrdersModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      { $project: { customer_id: 0 } },
      { $sort: { createdAt: -1 } },
    ]);

    if (orders.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No orders found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: "Successful", data: orders },
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
