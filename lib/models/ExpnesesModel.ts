// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface
export interface Expense extends Document {
  category: string;
  description: string;
  amount: number;
  expense_date?: Date;
  receipt_url?: string;
  notes?: string;
  current_branch_Id: ObjectId;
}

// Define the schema
const ExpenseSchema: Schema<Expense> = new mongoose.Schema(
  {
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    expense_date: { type: Date, default: Date.now() },
    receipt_url: { type: String },
    notes: { type: String },
    current_branch_Id: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const ExpenseModel: Model<Expense> =
  mongoose.models.expenses ||
  mongoose.model<Expense>("expenses", ExpenseSchema);

// Export the model
export default ExpenseModel;
