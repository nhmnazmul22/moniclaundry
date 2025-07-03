import { dbConnect } from "@/lib/config/db";
import DepositTypeModel from "@/lib/models/DepositTypeModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get("branch_id");

    const matchStage: any = { is_active: true };
    let depositTypes: any[] = [];

    if (branch_id) {
      matchStage.current_branch_id = new mongoose.Types.ObjectId(branch_id);
      depositTypes = await DepositTypeModel.find(matchStage).sort({
        createdAt: -1,
      });
    }

    if (depositTypes.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Deposit types not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: depositTypes,
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
    const { name, purchase_price, deposit_value, branch_id } = body;

    if (!name || !purchase_price || !deposit_value || !branch_id) {
      return NextResponse.json(
        {
          status: "Failed",
          message:
            "Name, purchase price, deposit value, and branch ID are required",
        },
        { status: 400 }
      );
    }

    if (purchase_price <= 0 || deposit_value <= 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Purchase price and deposit value must be positive",
        },
        { status: 400 }
      );
    }

    const depositType = await DepositTypeModel.create({
      ...body,
      current_branch_id: branch_id,
    });

    if (!depositType) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create deposit type",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: depositType,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Deposit type name already exists for this branch",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
