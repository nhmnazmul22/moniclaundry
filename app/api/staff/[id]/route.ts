import { dbConnect } from "@/lib/config/db";
import StaffModel from "@/lib/models/StaffModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const staffId = (await params).id;

    if (!staffId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Please, insert a staff id to find stuff",
        },
        { status: 404 }
      );
    }

    const staff = await StaffModel.findById(staffId);

    if (!staff) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to fetching staff",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: staff,
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
    const staffId = (await params).id;
    const body = await request.json();

    // Update staff data
    const UpdatedStaff = await StaffModel.findByIdAndUpdate(
      staffId,
      {
        ...body,
      },
      { new: true }
    );

    if (!UpdatedStaff) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to update staff",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: UpdatedStaff,
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
    const staffId = (await params).id;

    if (!staffId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Please, insert a staff id to find stuff",
        },
        { status: 404 }
      );
    }

    const deletedStaff = await StaffModel.findByIdAndDelete(staffId);

    if (!deletedStaff) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to delete staff",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: deletedStaff,
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
