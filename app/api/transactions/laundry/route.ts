import { dbConnect } from "@/lib/config/db";
import CustomerModel from "@/lib/models/CustomersModel";
import TransactionModel from "@/lib/models/TransactionModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      customer_id,
      branch_id,
      amount,
      payment_method,
      deposit_amount,
      cash_amount,
      description,
      processed_by,
    } = body;

    if (!customer_id || !branch_id || !amount || !payment_method) {
      return NextResponse.json(
        {
          status: "Failed",
          message:
            "Customer ID, branch ID, Order ID, amount, and payment method are required",
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Amount must be positive",
        },
        { status: 400 }
      );
    }

    // Get customer
    const customer = await CustomerModel.findById(customer_id);
    if (!customer) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Customer not found or inactive",
        },
        { status: 404 }
      );
    }

    // Start transaction session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update customer balance and stats
      const updateData: any = {
        $inc: {
          total_orders: 1,
          total_spent: amount,
        },
      };

      if (deposit_amount > 0) {
        updateData.$inc.deposit_balance = -deposit_amount;
      }

      await CustomerModel.findByIdAndUpdate(customer_id, updateData, {
        session,
      });

      // Create transaction record
      const transaction = await TransactionModel.create(
        [
          {
            ...body,
            customer_id,
            current_branch_id: branch_id,
            amount,
            type: "laundry",
            payment_method,
            deposit_amount,
            cash_amount,
            description: description || "Laundry service payment",
            reference_id: `LAU-${Date.now()}`,
            processed_by,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Get updated customer data
      const updatedCustomer = await CustomerModel.findById(customer_id);

      return NextResponse.json(
        {
          status: "Successful",
          data: {
            transaction: transaction[0],
            customer: updatedCustomer,
            payment_breakdown: {
              total_amount: amount,
              deposit_used: deposit_amount,
              cash_paid: cash_amount,
              remaining_deposit_balance: updatedCustomer?.deposit_balance || 0,
            },
          },
        },
        { status: 201 }
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
