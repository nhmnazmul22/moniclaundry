import { dbConnect } from "@/lib/config/db";
import SettingModel from "@/lib/models/SettingModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET({ params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const settingId = (await params).id;

    if (!settingId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Please, insert a setting id to find setting",
        },
        { status: 404 }
      );
    }

    const setting = await SettingModel.findById(settingId);

    if (!setting) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to fetching setting",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: setting,
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
    const settingId = (await params).id;
    const body = await request.json();

    // Updated Setting data
    const updatedSetting = await SettingModel.findByIdAndUpdate(
      settingId,
      {
        ...body,
      },
      { new: true }
    );

    if (!updatedSetting) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to update setting",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: updatedSetting,
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
