import { dbConnect } from "@/lib/config/db";
import ExpenseCategoryModel from "@/lib/models/ExpensesCategoryModel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const expensesCategory = await ExpenseCategoryModel.find({});

    if (expensesCategory.length === 0) {
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
        data: expensesCategory,
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
    const { category } = body;

    if (!category) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Required field missing",
        },
        { status: 400 }
      );
    }

    const expensesCategory = await ExpenseCategoryModel.create(body);

    if (!expensesCategory) {
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
        data: expensesCategory,
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
