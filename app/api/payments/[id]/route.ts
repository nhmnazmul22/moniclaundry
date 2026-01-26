import { dbConnect } from "@/lib/config/db";
import PaymentsModel from "@/lib/models/PaymentsModel";
import UsersModel from "@/lib/models/UsersModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const paymentId = (await params).id;
    const payment = await PaymentsModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(paymentId) } },
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

    if (payment.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Payment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: payment[0],
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const paymentId = (await params).id;
    const body = await request.json();

    // Update service data
    const UpdatedPayment = await PaymentsModel.findByIdAndUpdate(
      paymentId,
      {
        ...body,
      },
      { new: true }
    );

    if (!UpdatedPayment) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to update payment",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: UpdatedPayment,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const paymentId = (await params).id;

    if (!paymentId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Please, insert a payment id to delete payment",
        },
        { status: 404 }
      );
    }

    const deletedPayment = await UsersModel.findByIdAndDelete(paymentId);

    if (!deletedPayment) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to delete payment",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: deletedPayment,
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
