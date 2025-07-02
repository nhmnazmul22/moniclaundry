import { dbConnect } from "@/lib/config/db";
import CustomerModel from "@/lib/models/CustomersModel";
import TransactionModel from "@/lib/models/TransactionModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

interface DepositReportData {
  no: number;
  nama: string;
  cif: string;
  tanggal_top_up_deposit: string;
  tanggal_transaksi: string;
  nilai_transaksi: number;
  total_top_up: number;
  total_penggunaan_deposit: number;
  saldo_akhir: number;
}

// Helper function to validate ObjectId
function isValidObjectId(id: string | null): boolean {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get("branch_id");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    // Validate branch_id if provided
    if (branch_id && !isValidObjectId(branch_id)) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Invalid branch_id format",
        },
        { status: 400 }
      );
    }

    const customerMatchStage: any = {};
    const transactionMatchStage: any = { status: "completed" };

    // Only add branch_id filter if it's valid
    if (branch_id && isValidObjectId(branch_id)) {
      customerMatchStage.current_branch_id = new mongoose.Types.ObjectId(
        branch_id
      );
      transactionMatchStage.branch_id = new mongoose.Types.ObjectId(branch_id);
    }

    // Add date filtering if provided
    if (start_date || end_date) {
      const dateFilter: any = {};
      if (start_date) {
        const startDateTime = new Date(start_date);
        if (isNaN(startDateTime.getTime())) {
          return NextResponse.json(
            {
              status: "Failed",
              message: "Invalid start_date format. Use YYYY-MM-DD",
            },
            { status: 400 }
          );
        }
        dateFilter.$gte = startDateTime;
      }
      if (end_date) {
        const endDateTime = new Date(end_date);
        if (isNaN(endDateTime.getTime())) {
          return NextResponse.json(
            {
              status: "Failed",
              message: "Invalid end_date format. Use YYYY-MM-DD",
            },
            { status: 400 }
          );
        }
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDateTime;
      }
      transactionMatchStage.createdAt = dateFilter;
    }

    // Total deposit balance across all customers
    const totalDepositBalance = await CustomerModel.aggregate([
      { $match: customerMatchStage },
      { $group: { _id: null, total: { $sum: "$deposit_balance" } } },
    ]);

    // Today's transactions count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactionMatchStage = {
      ...transactionMatchStage,
      createdAt: { $gte: today, $lt: tomorrow },
    };

    const todayTransactions = await TransactionModel.countDocuments(
      todayTransactionMatchStage
    );

    // Expiring deposits (within 2 weeks)
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    const expiringDepositsMatchStage = {
      ...customerMatchStage,
      has_expiry: true,
      expiry_date: { $lte: twoWeeksFromNow },
      deposit_balance: { $gt: 0 },
    };

    const expiringDeposits = await CustomerModel.find(
      expiringDepositsMatchStage
    )
      .select("name phone deposit_balance expiry_date deposit_type")
      .lean();

    // Get customers with their transactions for the report
    const customersWithTransactions = await CustomerModel.aggregate([
      { $match: customerMatchStage },
      {
        $lookup: {
          from: "transactions",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customer_id", "$$customerId"] },
                status: "completed",
                ...(start_date || end_date
                  ? {
                      createdAt: {
                        ...(start_date && { $gte: new Date(start_date) }),
                        ...(end_date && {
                          $lte: (() => {
                            const endDateTime = new Date(end_date);
                            endDateTime.setHours(23, 59, 59, 999);
                            return endDateTime;
                          })(),
                        }),
                      },
                    }
                  : {}),
              },
            },
          ],
          as: "transactions",
        },
      },
      {
        $addFields: {
          // Calculate total top-up (deposit purchases)
          total_top_up: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$transactions",
                    cond: { $eq: ["$$this.type", "deposit_purchase"] },
                  },
                },
                as: "transaction",
                in: "$$transaction.amount",
              },
            },
          },
          // Calculate total deposit usage (laundry payments with deposit)
          total_penggunaan_deposit: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$transactions",
                    cond: { $eq: ["$$this.type", "laundry"] },
                  },
                },
                as: "transaction",
                in: { $ifNull: ["$$transaction.deposit_amount", 0] },
              },
            },
          },
          // Get latest top-up transaction
          latest_top_up: {
            $arrayElemAt: [
              {
                $sortArray: {
                  input: {
                    $filter: {
                      input: "$transactions",
                      cond: { $eq: ["$$this.type", "deposit_purchase"] },
                    },
                  },
                  sortBy: { createdAt: -1 },
                },
              },
              0,
            ],
          },
          // Get latest transaction
          latest_transaction: {
            $arrayElemAt: [
              {
                $sortArray: {
                  input: "$transactions",
                  sortBy: { createdAt: -1 },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            { "transactions.0": { $exists: true } }, // Has transactions
            { deposit_balance: { $gt: 0 } }, // Or has deposit balance
          ],
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    // Format the deposit report data
    const depositReportData: DepositReportData[] =
      customersWithTransactions.map((customer: any, index) => ({
        no: index + 1,
        nama: customer.name || "Unknown",
        cif: customer._id.toString().slice(-8),
        tanggal_top_up_deposit: customer.latest_top_up
          ? new Date(customer.latest_top_up.createdAt).toLocaleDateString(
              "id-ID",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )
          : "-",
        tanggal_transaksi: customer.latest_transaction
          ? new Date(customer.latest_transaction.createdAt).toLocaleDateString(
              "id-ID",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )
          : "-",
        nilai_transaksi: customer.latest_transaction
          ? customer.latest_transaction.amount || 0
          : 0,
        total_top_up: customer.total_top_up || 0,
        total_penggunaan_deposit: customer.total_penggunaan_deposit || 0,
        saldo_akhir: customer.deposit_balance || 0,
      }));

    return NextResponse.json(
      {
        status: "Successful",
        data: {
          // Essential summary data
          total_deposit_balance: totalDepositBalance[0]?.total || 0,
          today_transactions_count: todayTransactions,
          expiring_deposits_count: expiringDeposits.length,
          expiring_deposits: expiringDeposits,

          // Main deposit report data
          deposit_report_data: depositReportData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      {
        status: "Failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
