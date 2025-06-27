import { dbConnect } from "@/lib/config/db";
import OrdersModel from "@/lib/models/OrdersModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const orderId = (await params).id;
    const order = await OrdersModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
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

    if (order.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: order[0],
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
    const orderId = (await params).id;
    const body = await request.json();

    // Update Order data
    const UpdatedOrder = await OrdersModel.findByIdAndUpdate(
      orderId,
      {
        ...body,
      },
      { new: true }
    );

    if (!UpdatedOrder) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to update order",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: UpdatedOrder,
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
    const orderId = (await params).id;

    if (!orderId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Please, insert a order id to delete order",
        },
        { status: 404 }
      );
    }

    const deletedOrder = await OrdersModel.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to delete order",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: deletedOrder,
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
