import { dbConnect } from "@/lib/config/db";
import ExpenseModel from "@/lib/models/ExpnesesModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const expenses = await ExpenseModel.find({});

    if (expenses.length === 0 || !expenses) {
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

    const { category, amount, description, current_branch_id } = body;

    if (!category || !amount || !description || !current_branch_id) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    // Create new expenses data
    const expenses = await ExpenseModel.create(body);

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
