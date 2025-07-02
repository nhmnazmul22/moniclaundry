import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "Aqua",
        "Bensin Kurir",
        "Bensin Mobil",
        "Gas",
        "Kasbon",
        "Kebutuhan Laundry",
        "Lainnya",
        "Lembur",
        "Medis",
        "Traktir Karyawan",
        "Uang Training",
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    current_branch_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ExpenseModel =
  mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default ExpenseModel;
