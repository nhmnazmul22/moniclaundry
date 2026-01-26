import { dbConnect } from "@/lib/config/db";
import CustomerModel from "@/lib/models/CustomersModel";
import DepositTypeModel from "@/lib/models/DepositTypeModel";
import TransactionModel from "@/lib/models/TransactionModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      customer_id,
      deposit_type_id,
      has_expiry,
      expiry_date,
      processed_by,
    } = body;

    if (!customer_id || !deposit_type_id) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Customer ID and deposit type ID are required",
        },
        { status: 400 }
      );
    }

    // Get deposit type details
    const depositType = await DepositTypeModel.findById(deposit_type_id);
    if (!depositType || !depositType.is_active) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Deposit type not found or inactive",
        },
        { status: 404 }
      );
    }

    // Get customer
    const customer = await CustomerModel.findById(customer_id);
    if (!customer || !customer.is_active) {
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
      // Update customer with new deposit
      const updatedCustomer = await CustomerModel.findByIdAndUpdate(
        customer_id,
        {
          $inc: {
            deposit_balance: depositType.deposit_value,
            total_deposit: depositType.purchase_price,
          },
          deposit_type: depositType.name,
          deposit_type_id: depositType._id,
          has_expiry,
          expiry_date: has_expiry ? expiry_date : null,
        },
        { new: true, session }
      );

      // Create transaction record
      const transaction = await TransactionModel.create(
        [
          {
            customer_id,
            current_branch_id: customer.current_branch_id,
            amount: depositType.deposit_value,
            type: "deposit_purchase",
            payment_method: "cash",
            description: `Purchase ${depositType.name} deposit - Paid: ${depositType.purchase_price}`,
            reference_id: `DEP-${Date.now()}`,
            processed_by,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return NextResponse.json(
        {
          status: "Successful",
          data: {
            customer: updatedCustomer,
            transaction: transaction[0],
            deposit_type: depositType,
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
