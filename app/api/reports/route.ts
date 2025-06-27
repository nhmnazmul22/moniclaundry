import { dbConnect } from "@/lib/config/db";
import ReportsModel from "@/lib/models/ReportsModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const reports = await ReportsModel.find({});

    if (!reports) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to fetching reports",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: reports,
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

    const { report_type, report_data, current_branch_id } = body;

    if (!report_type || !report_data || !current_branch_id) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // Create new Report data
    const report = await ReportsModel.create(body);

    if (!report) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create report",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: report,
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
