import { dbConnect } from "@/lib/config/db";
import CustomerModel from "@/lib/models/CustomersModel";
import TransactionModel from "@/lib/models/TransactionModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const transactionId = (await params).id;
    const body = await request.json();
    const { processed_by, reason } = body;

    // Start transaction session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get transaction
      const transaction = await TransactionModel.findById(
        transactionId
      ).session(session);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status === "cancelled") {
        throw new Error("Transaction already cancelled");
      }

      // Get customer
      const customer = await CustomerModel.findById(
        transaction.customer_id
      ).session(session);

      if (!customer) {
        throw new Error("Customer not found");
      }

      let refundAmount = 0;
      const updateData: any = {};

      if (transaction.type === "laundry") {
        // Refund deposit amount if any was used
        if (transaction.deposit_amount && transaction.deposit_amount > 0) {
          refundAmount = transaction.deposit_amount;
          updateData.$inc = {
            deposit_balance: refundAmount,
            total_orders: -1,
            total_spent: -transaction.amount,
          };
        } else {
          updateData.$inc = {
            total_orders: -1,
            total_spent: -transaction.amount,
          };
        }
      } else if (transaction.type === "deposit_purchase") {
        // Refund the deposit value that was added to balance
        refundAmount = transaction.amount;
        updateData.$inc = {
          deposit_balance: -refundAmount,
          total_deposit: -refundAmount,
        };
        updateData.$unset = {
          deposit_type: "",
          deposit_type_id: "",
          has_expiry: "",
          expiry_date: "",
        };
      }

      // Update customer
      if (Object.keys(updateData).length > 0) {
        await CustomerModel.findByIdAndUpdate(
          transaction.customer_id,
          updateData,
          { session }
        );
      }

      // Update transaction status
      await TransactionModel.findByIdAndUpdate(
        transactionId,
        {
          status: "cancelled",
          description: `${transaction.description} - CANCELLED: ${
            reason || "No reason provided"
          }`,
        },
        { session }
      );

      await session.commitTransaction();

      // Get updated customer data
      const updatedCustomer = await CustomerModel.findById(
        transaction.customer_id
      );

      return NextResponse.json(
        {
          status: "Successful",
          message: "Transaction cancelled successfully",
          data: {
            cancelled_transaction: transaction,
            refund_amount: refundAmount,
            customer: updatedCustomer,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "Failed",
        message: error.message || "Failed to cancel transaction",
      },
      { status: 500 }
    );
  }
}
