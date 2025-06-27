import { dbConnect } from "@/lib/config/db";
import SettingModel from "@/lib/models/SettingModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await SettingModel.find({});

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

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Create new Setting Obj
    const settings = await SettingModel.create(body);

    if (!settings) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create setting",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: settings,
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
