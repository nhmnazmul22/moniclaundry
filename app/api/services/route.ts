import { dbConnect } from "@/lib/config/db";
import ServiceModel from "@/lib/models/ServicesModel";
import { Service } from "@/types";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get("branch_id");

    let services: Service[] = [];

    if (branch_id) {
      const branchObjectId = new mongoose.Types.ObjectId(branch_id);
      services = await ServiceModel.find({
        current_branch_id: { $in: [branchObjectId] },
      });
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: services,
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

    const { current_branch_id, category, servicename, price } = body;

    if (!category || !current_branch_id || !servicename || !price) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    const service = await ServiceModel.create({ ...body });

    if (!service) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Service create filed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: service,
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
