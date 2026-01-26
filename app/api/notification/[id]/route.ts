import { dbConnect } from "@/lib/config/db";
import NotificationModel from "@/lib/models/NotificationMode";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const notificationId = (await params).id;
    const body = await request.json();

    const { status } = body;

    if (!status) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // Update notification data
    const notification = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { status: status }
    );

    if (!notification) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to update notification",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: notification,
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
