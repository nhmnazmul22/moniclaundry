// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface
export interface InventoryItem extends Document {
  item_name: string;
  category?: string;
  current_stock: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  cost_per_unit?: number;
  selling_price?: number;
  supplier?: string;
  last_restock?: Date;
  expiry_date?: Date;
  current_branch_id: ObjectId;
}

// Define the schema
const InventoryItemSchema: Schema<InventoryItem> = new mongoose.Schema(
  {
    item_name: { type: String, required: true },
    category: { type: String },
    current_stock: { type: Number, required: true, default: 0 },
    min_stock: { type: Number, default: 10 },
    max_stock: { type: Number, default: 1000 },
    unit: { type: String },
    cost_per_unit: { type: Number },
    selling_price: { type: Number },
    supplier: { type: String },
    last_restock: { type: Date },
    expiry_date: { type: Date },
    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const InventoryItemModel: Model<InventoryItem> =
  mongoose.models.inventories ||
  mongoose.model<InventoryItem>("inventories", InventoryItemSchema);

// Export the model
export default InventoryItemModel;
