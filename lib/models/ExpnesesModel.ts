import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
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
      type: mongoose.Types.ObjectId,
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
