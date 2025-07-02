import { dbConnect } from "@/lib/config/db";
import BranchModel from "@/lib/models/BranchesModel";
import { Branches } from "@/types";
import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "User Unauthorized",
        },
        { status: 401 }
      );
    }

    let branches: Branches[] = [];
    branches = await BranchModel.find({});

    if (token.current_branch_id && token.current_branch_id.length > 0) {
      branches = branches.filter((branch) =>
        token?.current_branch_id?.includes(branch._id.toString())
      );
    }

    if (!branches) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to fetching branches",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: branches,
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

    // Create new Branched data
    const branches = await BranchModel.create(body);

    if (!branches) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create branches",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: branches,
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
