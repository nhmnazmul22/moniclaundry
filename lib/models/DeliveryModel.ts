import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

export interface DeliverySchedule extends Document {
  order_id: ObjectId;
  kurir_id: ObjectId;
  delivery_type: string;
  scheduled_time: Date;
  actual_time?: Date;
  status?: string;
  customer_address?: string;
  delivery_fee?: number;
  notes?: string;
  current_branch_id: ObjectId;
}

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
    customer_address: { type: String },
    delivery_fee: { type: Number, default: 0 },
    notes: { type: String },
    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

const DeliveryScheduleModel: Model<DeliverySchedule> =
  mongoose.models.delivery ||
  mongoose.model<DeliverySchedule>("delivery", DeliveryScheduleSchema);

export default DeliveryScheduleModel;
