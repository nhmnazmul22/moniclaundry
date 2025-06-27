import { dbConnect } from "@/lib/config/db";
import DeliveryScheduleModel from "@/lib/models/DeliveryModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const deliveries = await DeliveryScheduleModel.aggregate([
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

    const { order_id, kurir_id, scheduled_time, current_branch_id } = body;

    if (!order_id || !kurir_id || !scheduled_time || !current_branch_id) {
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
