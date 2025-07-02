import { dbConnect } from "@/lib/config/db";
import CustomerModel from "@/lib/models/CustomersModel";
import { Customer } from "@/types";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get("branch_id");

    const matchStage: any = {};
    let customers: Customer[] = [];
    if (branch_id) {
      matchStage.current_branch_id = new mongoose.Types.ObjectId(branch_id);
      customers = await CustomerModel.find(matchStage);
    }

    if (customers.length === 0 || !customers) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Customers data not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: customers,
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
    const { name, phone, email, current_branch_id } = body;

    if (!name || !phone || !email || !current_branch_id) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // Create new customer data
    const customer = await CustomerModel.create(body);

    if (!customer) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create customer",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: customer,
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
