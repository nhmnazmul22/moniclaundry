import { Customer } from "@/types";
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

export interface DeliverySchedule extends Document {
  order_id: ObjectId;
  kurir_id: ObjectId;
  delivery_type: string;
  scheduled_time: Date;
  actual_time?: Date;
  status?: string;
  customer?: any;
  delivery_fee?: number;
  notes?: string;
  current_branch_id: ObjectId;
}

const CustomerSchema: Schema<Customer> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    total_orders: { type: Number, default: 0 },
    total_spent: { type: Number, default: 0 },
    total_deposit: { type: Number, default: 0 },
    deposit_balance: { type: Number, default: 0 },
    deposit_type: { type: String },
    deposit_type_id: { type: mongoose.Types.ObjectId },
    has_expiry: { type: Boolean },
    expiry_date: { type: Date },
    is_active: { type: Boolean },
    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

const DeliveryScheduleSchema: Schema<DeliverySchedule> = new mongoose.Schema(
  {
    order_id: { type: mongoose.Types.ObjectId, required: true },
    kurir_id: { type: mongoose.Types.ObjectId, required: true },
    delivery_type: { type: String, enum: ["pickup", "delivery"] },
    scheduled_time: { type: Date, required: true },
    actual_time: { type: Date },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "failed", "cancelled"],
      default: "scheduled",
    },
    customer: { type: CustomerSchema },
    delivery_fee: { type: Number, default: 0 },
    notes: { type: String },
    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

const DeliveryScheduleModel: Model<DeliverySchedule> =
  mongoose.models.deliveries ||
  mongoose.model<DeliverySchedule>("deliveries", DeliveryScheduleSchema);

export default DeliveryScheduleModel;
