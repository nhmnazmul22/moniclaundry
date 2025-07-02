import { dbConnect } from "@/lib/config/db";
import PaymentsModel from "@/lib/models/PaymentsModel";
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

    const payments = await PaymentsModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "orderDetails",
        },
      },
      {
        $unwind: "$orderDetails",
      },
      {
        $project: {
          order_id: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    if (payments.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to fetching payment",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: payments,
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

    const { order_id, amount, payment_method, current_branch_id } = body;

    if (!order_id || !amount || !payment_method || !current_branch_id) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // Create new payment data
    const payment = await PaymentsModel.create(body);

    if (!payment) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create payment",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: payment,
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
