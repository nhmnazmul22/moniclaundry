import { dbConnect } from "@/lib/config/db";
import ExpenseCategoryModel from "@/lib/models/ExpensesCategoryModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const categoryId = (await params).id;
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

    const expensesCategory = await ExpenseCategoryModel.findByIdAndUpdate(
      categoryId,
      { ...body }
    );

    if (!expensesCategory) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to update expense category",
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const categoryId = (await params).id;

    if (!categoryId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Category Id not found",
        },
        { status: 404 }
      );
    }

    const expensesCategory = await ExpenseCategoryModel.deleteOne({
      _id: new mongoose.Types.ObjectId(categoryId),
    });

    if (!expensesCategory) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to delete expense category",
        },
        { status: 500 }
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
