import { dbConnect } from "@/lib/config/db";
import UsersModel from "@/lib/models/UsersModel";
import bcrypt from "bcrypt";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const users = await UsersModel.find({}, { password: 0 });

    if (!users) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to fetching users",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: users,
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

    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // find user exist or not
    const prevUser = await UsersModel.findOne({ email: email });

    if (prevUser) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "User already exist, please try another user.",
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

    console.log(body);

    // Create new Branched data
    const user = await UsersModel.create({ ...body, password: hashedPassword });

    if (!user) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create user",
        },
        { status: 500 }
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
