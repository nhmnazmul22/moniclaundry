import { dbConnect } from "@/lib/config/db";
import BranchModel from "@/lib/models/BranchesModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const branches = await BranchModel.find({});

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
