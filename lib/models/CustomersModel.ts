import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

export interface Customer extends Document {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  loyalty_points?: number;
  total_orders?: number;
  total_spent?: number;
  total_deposit?: number;
  current_branch_id: ObjectId;
}

const CustomerSchema: Schema<Customer> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    loyalty_points: { type: Number, default: 0 },
    total_orders: { type: Number, default: 0 },
    total_spent: { type: Number, default: 0 },
    total_deposit: { type: Number, default: 0 },
    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

const CustomerModel: Model<Customer> =
  mongoose.models.customers ||
  mongoose.model<Customer>("customers", CustomerSchema);

export default CustomerModel;
