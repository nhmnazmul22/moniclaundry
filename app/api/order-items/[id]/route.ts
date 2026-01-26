import { dbConnect } from "@/lib/config/db";
import OrderItemsModel from "@/lib/models/OrderItemsModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const orderItemsId = (await params).id;

    if (!orderItemsId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Category Id not found",
        },
        { status: 404 }
      );
    }

    const deletedOrderItems = await OrderItemsModel.deleteOne({
      _id: new mongoose.Types.ObjectId(orderItemsId),
    });

    if (!deletedOrderItems) {
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
        data: deletedOrderItems,
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
