// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface
export interface Payments extends Document {
  order_id: ObjectId;
  amount: number;
  payment_method: string;
  payment_date?: Date;
  reference_number?: string;
  bank_name?: string;
  account_number?: string;
  notes?: string;
  status?: string;
  current_branch_id?: ObjectId;
}

// Define the schema
const PaymentSchema: Schema<Payments> = new mongoose.Schema(
  {
    order_id: { type: mongoose.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    payment_method: { type: String, required: true },
    payment_date: { type: Date, default: Date.now },
    reference_number: { type: String },
    bank_name: { type: String },
    account_number: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const PaymentsModel: Model<Payments> =
  mongoose.models.payments ||
  mongoose.model<Payments>("payments", PaymentSchema);

// Export the model
export default PaymentsModel;
