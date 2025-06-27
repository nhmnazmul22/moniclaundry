import { dbConnect } from "@/lib/config/db";
import StaffModel from "@/lib/models/StaffModel";
import bcrypt from "bcrypt";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const staffs = await StaffModel.find({});

    if (!staffs) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to fetching staffs",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: staffs,
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
    console.log(body);
    const { full_name, email, password, role, current_branch_id } = body;

    if (!full_name || !email || !password || !role || !current_branch_id) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    const prevStaff = await StaffModel.findOne({ email: email });

    if (prevStaff) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Staff already exist",
        },
        { status: 400 }
      );
    }

    // Bcrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!hashedPassword) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Password hashing failed",
        },
        { status: 400 }
      );
    }

    // Create new Branched data
    const staff = await StaffModel.create({
      ...body,
      password: hashedPassword,
    });

    if (!staff) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create staff",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: staff,
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
