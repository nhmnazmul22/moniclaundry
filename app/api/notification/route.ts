import { dbConnect } from "@/lib/config/db";
import NotificationModel from "@/lib/models/NotificationMode";
import { NotificationType } from "@/types";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get("branch_id");

    const matchStage: any = {};
    let notification: NotificationType[] = [];

    if (branch_id) {
      matchStage.current_branch_id = new mongoose.Types.ObjectId(branch_id);
      notification = await NotificationModel.find(matchStage);
    }

    if (notification.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No notification found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: "Successful", data: notification },
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

    const { title, description, status, current_branch_id } = body;

    if (!title || !description || !status || !current_branch_id) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // Create new notification data
    const notification = await NotificationModel.create(body);

    if (!notification) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create notification",
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
