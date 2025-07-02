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
      order_id,
      branch_id,
      amount,
      payment_method,
      deposit_amount,
      cash_amount,
      description,
      processed_by,
    } = body;

    if (!customer_id || !branch_id || !order_id || !amount || !payment_method) {
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

    // Validate payment method and amounts
    if (payment_method === "deposit" && customer.deposit_balance! < amount) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Insufficient deposit balance",
        },
        { status: 400 }
      );
    }

    if (payment_method === "mixed") {
      const totalPayment = (deposit_amount || 0) + (cash_amount || 0);
      if (totalPayment !== amount) {
        return NextResponse.json(
          {
            status: "Failed",
            message: "Deposit amount + cash amount must equal total amount",
          },
          { status: 400 }
        );
      }

      if ((deposit_amount || 0) > customer.deposit_balance!) {
        return NextResponse.json(
          {
            status: "Failed",
            message: "Insufficient deposit balance for mixed payment",
          },
          { status: 400 }
        );
      }
    }

    // Start transaction session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let balanceDeduction = 0;

      if (payment_method === "deposit") {
        balanceDeduction = amount;
      } else if (payment_method === "mixed") {
        balanceDeduction = deposit_amount || 0;
      }

      // Update customer balance and stats
      const updateData: any = {
        $inc: {
          total_orders: 1,
          total_spent: amount,
        },
      };

      if (balanceDeduction > 0) {
        updateData.$inc.deposit_balance = -balanceDeduction;
      }

      await CustomerModel.findByIdAndUpdate(customer_id, updateData, {
        session,
      });

      // Create transaction record
      const transaction = await TransactionModel.create(
        [
          {
            customer_id,
            order_id,
            current_branch_id: branch_id,
            amount,
            type: "laundry",
            payment_method,
            deposit_amount: balanceDeduction > 0 ? balanceDeduction : undefined,
            cash_amount:
              payment_method === "mixed"
                ? cash_amount
                : payment_method !== "deposit"
                ? amount
                : undefined,
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
              deposit_used: balanceDeduction,
              cash_paid:
                payment_method === "mixed"
                  ? cash_amount
                  : payment_method !== "deposit"
                  ? amount
                  : 0,
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
