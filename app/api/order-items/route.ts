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
            localField: "service_id",
            foreignField: "_id",
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

export async function PUT(req: NextRequest) {
  await dbConnect();
  const order_items = await req.json();

  const bulkUpdateOps = [];
  const newItems = [];

  for (const item of order_items) {
    if (item._id) {
      // Prepare update for existing item
      bulkUpdateOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              service_id: item.service_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.subtotal,
              current_branch_id: item.current_branch_id,
            },
          },
        },
      });
    } else {
      // Prepare insert for new item
      newItems.push(item);
    }
  }

  // Run updates and inserts
  const [updateResult, insertResult] = await Promise.all([
    bulkUpdateOps.length > 0
      ? OrderItemsModel.bulkWrite(bulkUpdateOps)
      : Promise.resolve(null),
    newItems.length > 0
      ? OrderItemsModel.insertMany(newItems)
      : Promise.resolve([]),
  ]);

  return NextResponse.json(
    {
      message: "OrderItems updated and added successfully.",
      updated: updateResult,
      inserted: insertResult,
    },
    { status: 201 }
  );
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
