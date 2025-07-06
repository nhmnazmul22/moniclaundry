import { dbConnect } from "@/lib/config/db";
import CustomerModel from "@/lib/models/CustomersModel";
import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get("branch_id");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    const matchStage: any = {};

    if (branch_id) {
      matchStage.current_branch_id = new mongoose.Types.ObjectId(branch_id);
    }

    const dateFilter: any = {};
    if (start_date) {
      const from = new Date(start_date);
      from.setHours(0, 0, 0, 0);
      dateFilter.$gte = from;
    }
    if (end_date) {
      const to = new Date(end_date);
      to.setHours(23, 59, 59, 999);
      dateFilter.$lte = to;
    }

    const customers = await CustomerModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "transactions",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customer_id", "$$customerId"] },
                status: "completed",
                ...(Object.keys(dateFilter).length > 0 && {
                  createdAt: dateFilter,
                }),
              },
            },
          ],
          as: "transactions",
        },
      },
      {
        $addFields: {
          jumlahDeposit: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$transactions",
                    cond: { $eq: ["$$this.type", "deposit_purchase"] },
                  },
                },
                as: "t",
                in: "$$t.amount",
              },
            },
          },
          jumlahTransaksi: {
            $size: {
              $filter: {
                input: "$transactions",
                as: "t",
                cond: { $eq: ["$$t.type", "laundry"] },
              },
            },
          },
          nilaiTransaksi: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$transactions",
                    cond: { $eq: ["$$this.type", "laundry"] },
                  },
                },
                as: "t",
                in: "$$t.amount",
              },
            },
          },
          jumlahTransaksiKiloan: {
            $size: {
              $filter: {
                input: "$transactions",
                as: "t",
                cond: {
                  $and: [
                    { $eq: ["$$t.type", "laundry"] },
                    { $eq: ["$$t.laundry_category", "kiloan"] },
                  ],
                },
              },
            },
          },
          jumlahTransaksiSatuan: {
            $size: {
              $filter: {
                input: "$transactions",
                as: "t",
                cond: {
                  $and: [
                    { $eq: ["$$t.type", "laundry"] },
                    { $eq: ["$$t.laundry_category", "satuan"] },
                  ],
                },
              },
            },
          },
          tanggalCuciAwal: {
            $let: {
              vars: {
                sortedLaundry: {
                  $sortArray: {
                    input: {
                      $filter: {
                        input: "$transactions",
                        as: "t",
                        cond: { $eq: ["$$t.type", "laundry"] },
                      },
                    },
                    sortBy: { createdAt: 1 },
                  },
                },
              },
              in: {
                $cond: [
                  { $gt: [{ $size: "$$sortedLaundry" }, 0] },
                  {
                    $dateToString: {
                      date: { $arrayElemAt: ["$$sortedLaundry.createdAt", 0] },
                      format: "%d-%m-%Y",
                    },
                  },
                  "-",
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          cif: {
            $cond: [
              { $ifNull: ["$phone", false] },
              "$phone",
              { $substr: ["$_id", -8, 8] },
            ],
          },
          nama: "$name",
          tanggalCuciAwal: 1,
          jumlahDeposit: 1,
          saldoDeposit: "$deposit_balance",
          jumlahTransaksi: 1,
          nilaiTransaksi: 1,
          jumlahTransaksiKiloan: 1,
          jumlahTransaksiSatuan: 1,
        },
      },
      { $sort: { nama: 1 } },
    ]);
    return NextResponse.json(
      {
        status: "Success",
        data: customers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Customer Report Error:", error);
    return NextResponse.json(
      {
        status: "Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
