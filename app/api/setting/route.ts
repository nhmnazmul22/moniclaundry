import { dbConnect } from "@/lib/config/db";
import SettingModel from "@/lib/models/SettingModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await SettingModel.findOne({});

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

export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();

    const updated = await SettingModel.findOneAndUpdate(
      {},
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
