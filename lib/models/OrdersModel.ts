// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface
export interface Orders extends Document {
  order_number: string;
  customer_id?: ObjectId;
  total_weight?: number;
  total_unit?: number;
  subtotal: number;
  discount?: number;
  tax?: number;
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  order_status?: string;
  pickup_date?: Date;
  delivery_date?: Date;
  estimated_completion?: Date;
  notes?: string;
  created_by?: ObjectId;
  special_instructions?: string;
  current_branch_id: ObjectId;
}

// Define the schema
const OrderSchema: Schema<Orders> = new mongoose.Schema(
  {
    order_number: { type: String, required: true },
    customer_id: { type: mongoose.Types.ObjectId },
    total_weight: { type: Number, default: 0 },
    total_unit: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    payment_method: {
      type: String,
      enum: ["cash", "transfer", "qris", "deposit"],
    },
    payment_status: {
      type: String,
      enum: ["lunas", "belum lunas", "dp"],
      default: "belum lunas",
    },
    order_status: {
      type: String,
      enum: ["diterima", "diproses", "selesai"],
      default: "diterima",
    },
    pickup_date: { type: Date },
    delivery_date: { type: Date },
    estimated_completion: { type: Date },
    notes: { type: String },
    created_by: { type: mongoose.Types.ObjectId },
    special_instructions: { type: String },
    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const OrdersModel: Model<Orders> =
  mongoose.models.orders || mongoose.model<Orders>("orders", OrderSchema);

// Export the model
export default OrdersModel;
