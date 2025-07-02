import { dbConnect } from "@/lib/config/db";
import OrderItemsModel from "@/lib/models/OrderItemsModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get("order_id");

    const matchStage: any = {};
    let orderItems = [];

    if (order_id) {
      matchStage.order_id = new mongoose.Types.ObjectId(order_id);
      orderItems = await OrderItemsModel.aggregate([
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
          $lookup: {
            from: "services",
            let: { serviceId: "$service_id" },
            pipeline: [
              { $unwind: "$services" },
              {
                $match: {
                  $expr: {
                    $eq: ["$services._id", "$$serviceId"],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  services: "$services",
                  branch_name: 1,
                  name: 1,
                },
              },
            ],
            as: "serviceDetails",
          },
        },
        { $unwind: "$serviceDetails" },
        {
          $project: {
            order_id: 0,
            service_id: 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
    }

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

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get("order_id");

    const matchStage: any = {};
    let orderItems;

    if (order_id) {
      matchStage.order_id = new mongoose.Types.ObjectId(order_id);
      orderItems = await OrderItemsModel.deleteMany(matchStage);
    }

    if (!orderItems) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Order Items delete failed",
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
