import mongoose, {
  type Document,
  type Model,
  type ObjectId,
  type Schema,
} from "mongoose";

export interface Transaction extends Document {
  customer_id: ObjectId;
  current_branch_id: ObjectId;
  order_id: ObjectId;
  amount: number;
  type: "laundry" | "deposit_purchase" | "refund" | "adjustment";
  laundry_satuan: number;
  laundry_kiloan: number;
  payment_method: "deposit" | "cash" | "transfer" | "qris" | "mixed";
  deposit_amount?: number;
  cash_amount?: number;
  status: "completed" | "cancelled" | "pending";
  description?: string;
  reference_id?: string;
  processed_by?: ObjectId;
}

const TransactionSchema: Schema<Transaction> = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "customers",
    },
    current_branch_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "branches",
    },
    order_id: {
      type: mongoose.Types.ObjectId,
      ref: "orders",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["laundry", "deposit_purchase", "refund", "adjustment"],
      required: true,
    },
    laundry_kiloan: { type: Number },
    laundry_satuan: { type: Number },
    payment_method: {
      type: String,
      enum: ["deposit", "cash", "transfer", "qris", "mixed"],
      required: true,
    },
    deposit_amount: { type: Number, min: 0 },
    cash_amount: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["completed", "cancelled", "pending"],
      default: "completed",
    },
    description: { type: String, trim: true },
    reference_id: { type: String, trim: true },
    processed_by: { type: mongoose.Types.ObjectId, ref: "users" },
  },
  { timestamps: true, versionKey: false }
);

// Indexes for better query performance
TransactionSchema.index({ customer_id: 1, createdAt: -1 });
TransactionSchema.index({ branch_id: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ status: 1, createdAt: -1 });

const TransactionModel: Model<Transaction> =
  mongoose.models.transactions ||
  mongoose.model<Transaction>("transactions", TransactionSchema);

export default TransactionModel;
