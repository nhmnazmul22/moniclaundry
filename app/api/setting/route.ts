import { dbConnect } from "@/lib/config/db";
import SettingModel from "@/lib/models/SettingModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get("branch_id");

    if (!branchIdParam) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Branch id not found",
        },
        { status: 404 }
      );
    }

    const settings = await SettingModel.findOne({
      current_branch_id: new mongoose.Types.ObjectId(branchIdParam),
    });

    if (!settings) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to fetching settings",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: settings,
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

export async function PUT(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get("branch_id");

    if (!branchIdParam) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Branch id not found",
        },
        { status: 404 }
      );
    }

    const updated = await SettingModel.findOneAndUpdate(
      { current_branch_id: new mongoose.Types.ObjectId(branchIdParam) },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Business settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT /business-settings error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
