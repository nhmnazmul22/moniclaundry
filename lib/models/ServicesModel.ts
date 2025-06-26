// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface for the data
export interface Service extends Document {
  name: string;
  description?: string;
  price_per_kg: number;
  min_weight: number;
  estimated_hours?: string;
  category: string;
  is_active: Boolean;
  current_branch_id: ObjectId;
}

// Define the schema
const DataSchema: Schema<Service> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price_per_kg: { type: Number, required: true },
    min_weight: { type: Number, required: true },
    estimated_hours: { type: String },
    category: { type: String, required: true },
    is_active: { type: Boolean, required: true },
    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const ServiceModel: Model<Service> =
  mongoose.models.services || mongoose.model<Service>("services", DataSchema);

// Export the model
export default ServiceModel;
