import { dbConnect } from "@/lib/config/db";
import StaffModel from "@/lib/models/StaffModel";
import UsersModel from "@/lib/models/UsersModel";
import bcrypt from "bcrypt";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { email, password } = body.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    let user = null;

    user = await UsersModel.findOne({ email: email });

    if (user === null) {
      user = await StaffModel.findOne({ email: email });
    }

    if (user === null || !user) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Bcrypt the password
    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Password not matched",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: user,
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
