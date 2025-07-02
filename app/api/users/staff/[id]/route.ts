import { dbConnect } from "@/lib/config/db";
import UsersModel from "@/lib/models/UsersModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const userid = (await params).id;
    const user = await UsersModel.findOne({
      _id: new mongoose.Types.ObjectId(userid),
    });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const userId = (await params).id;
    const body = await request.json();

    // Update users data
    const UpdatedUser = await UsersModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const userId = (await params).id;

    if (!userId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Please, insert a user id to find user",
        },
        { status: 404 }
      );
    }

    const deletedUser = await UsersModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to delete user",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: deletedUser,
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
