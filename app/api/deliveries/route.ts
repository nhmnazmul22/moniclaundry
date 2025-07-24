import { dbConnect } from "@/lib/config/db";
import DeliveryScheduleModel from "@/lib/models/DeliveryModel";
import { Delivery } from "@/types";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get("branch_id");

    const matchStage: any = {};
    let deliveries: Delivery[] = [];

    if (branch_id) {
      matchStage.current_branch_id = new mongoose.Types.ObjectId(branch_id);
      deliveries = await DeliveryScheduleModel.aggregate([
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
          $lookup: {
            from: "users",
            localField: "kurir_id",
            foreignField: "_id",
            as: "kurirDetails",
          },
        },
        {
          $unwind: {
            path: "$orderDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$kurirDetails",
            preserveNullAndEmptyArrays: true, 
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
    }

    if (deliveries.length === 0 || !deliveries) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Deliveries data Not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: deliveries,
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

    const { kurir_id, scheduled_time, current_branch_id } = body;

    if (!kurir_id || !scheduled_time || !current_branch_id) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // Create new expenses data
    const delivery = await DeliveryScheduleModel.create(body);

    if (!delivery) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create delivery",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: delivery,
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
