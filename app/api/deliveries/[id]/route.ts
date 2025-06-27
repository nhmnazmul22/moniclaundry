import { dbConnect } from "@/lib/config/db";
import DeliveryScheduleModel from "@/lib/models/DeliveryModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const deliveryId = (await params).id;

    const delivery = await DeliveryScheduleModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(deliveryId) } },
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

    if (delivery.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Delivery not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: delivery[0],
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
    const deliveryId = (await params).id;
    const body = await request.json();

    // Update Delivery data
    const UpdatedDelivery = await DeliveryScheduleModel.findByIdAndUpdate(
      deliveryId,
      {
        ...body,
      },
      { new: true }
    );

    if (!UpdatedDelivery) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to update delivery",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: UpdatedDelivery,
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
    const deliveryId = (await params).id;

    if (!deliveryId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Please, insert a delivery id to delete delivery",
        },
        { status: 404 }
      );
    }

    const deletedDelivery = await DeliveryScheduleModel.findByIdAndDelete(
      deliveryId
    );

    if (!deletedDelivery) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to delete delivery",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: deletedDelivery,
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
