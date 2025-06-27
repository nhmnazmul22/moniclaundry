import { dbConnect } from "@/lib/config/db";
import ServiceModel from "@/lib/models/ServicesModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const services = await ServiceModel.find({});

    if (!services) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to fetching services",
        },
        { status: 500 }
      );
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

    const { name, price_per_kg, min_weight, category, current_branch_id } =
      body;

    if (
      !name ||
      !price_per_kg ||
      !min_weight ||
      !category ||
      !current_branch_id
    ) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // Create new Service data
    const service = await ServiceModel.create(body);

    if (!service) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create service",
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
