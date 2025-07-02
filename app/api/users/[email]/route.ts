import { dbConnect } from "@/lib/config/db";
import UsersModel from "@/lib/models/UsersModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    await dbConnect();
    const userEmail = (await params).email;
    const user = await UsersModel.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "User not found",
        },
        { status: 304 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: user,
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
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    await dbConnect();
    const userEmail = (await params).email;
    const body = await request.json();

    // Update users data
    const UpdatedUser = await UsersModel.updateOne(
      { email: userEmail },
      { ...body }
    );

    if (!UpdatedUser) {
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
        data: UpdatedUser,
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
