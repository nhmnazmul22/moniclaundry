// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface
export interface OrderItem extends Document {
  order_id?: ObjectId;
  service_id?: ObjectId;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  current_branch_id?: ObjectId;
}

// Define the schema
const OrderItemSchema: Schema<OrderItem> = new mongoose.Schema(
  {
    order_id: { type: mongoose.Types.ObjectId, ref: "orders", required: true },
    service_id: {
      type: mongoose.Types.ObjectId,
      ref: "services",
      require: true,
    },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    notes: { type: String },
    current_branch_id: {
      type: mongoose.Types.ObjectId,
      ref: "branches",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const OrderItemsModel: Model<OrderItem> =
  mongoose.models.orderitems ||
  mongoose.model<OrderItem>("orderitems", OrderItemSchema);

// Export the model
export default OrderItemsModel;
