import { dbConnect } from "@/lib/config/db";
import TransactionModel from "@/lib/models/TransactionModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get("branch_id");
    const customer_id = searchParams.get("customer_id");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "50");

    // Build match stage for aggregation
    const matchStage: any = {};

    if (branch_id) {
      matchStage.branch_id = new mongoose.Types.ObjectId(branch_id);
    }

    if (customer_id) {
      matchStage.customer_id = new mongoose.Types.ObjectId(customer_id);
    }

    if (type) {
      matchStage.type = type;
    }

    if (status) {
      matchStage.status = status;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get transactions with customer details
    const transactions = await TransactionModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          customer_name: "$customer.name",
          customer_phone: "$customer.phone",
        },
      },
      {
        $project: {
          customer: 0, // Remove the full customer object to reduce payload
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get total count for pagination
    const totalCount = await TransactionModel.countDocuments(matchStage);
    const totalPages = Math.ceil(totalCount / limit);

    if (transactions.length === 0) {
      return NextResponse.json(
        {
          status: "Successful",
          message: "No transactions found",
          data: [],
          pagination: {
            page,
            limit,
            total: totalCount,
            pages: totalPages,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: transactions,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        status: "Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
