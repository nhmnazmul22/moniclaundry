import { dbConnect } from "@/lib/config/db";
import ExpenseModel from "@/lib/models/ExpnesesModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get("branch_id");

    const matchStage: any = {};
    let expenses = [];

    if (branch_id) {
      matchStage.current_branch_id = new mongoose.Types.ObjectId(branch_id);
      expenses = await ExpenseModel.find(matchStage);
    }

    if (expenses.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Expenses data Not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: expenses,
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
    const { category, amount, description, current_branch_id, date } = body;

    if (!category || !amount || !description || !current_branch_id) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // Create new expenses data with date
    const expenseData = {
      ...body,
      date: date || new Date().toISOString(),
    };

    const expenses = await ExpenseModel.create(expenseData);

    if (!expenses) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create expenses",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: expenses,
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
