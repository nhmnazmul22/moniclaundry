import mongoose, {
  type Document,
  type Model,
  type ObjectId,
  type Schema,
} from "mongoose";

export interface Customer extends Document {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  loyalty_points?: number;
  total_orders?: number;
  total_spent?: number;
  current_branch_id: ObjectId;
  // New deposit-related fields
  deposit_balance?: number;
  deposit_type?: string;
  deposit_type_id?: ObjectId;
  has_expiry?: boolean;
  expiry_date?: Date;
  is_active?: boolean;
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
    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
    // New deposit fields
    deposit_balance: { type: Number, default: 0, min: 0 },
    deposit_type: { type: String },
    deposit_type_id: { type: mongoose.Types.ObjectId, ref: "deposit_types" },
    has_expiry: { type: Boolean, default: false },
    expiry_date: { type: Date },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// Indexes for better performance
CustomerSchema.index({ phone: 1, current_branch_id: 1 });
CustomerSchema.index({ current_branch_id: 1 });
CustomerSchema.index({ expiry_date: 1 });
CustomerSchema.index({ is_active: 1 });

const CustomerModel: Model<Customer> =
  mongoose.models.customers ||
  mongoose.model<Customer>("customers", CustomerSchema);

export default CustomerModel;
