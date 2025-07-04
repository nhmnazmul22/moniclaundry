// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface for the data
export interface Service extends Document {
  current_branch_id: [ObjectId];
  type?: string;
  category: string;
  servicename: string;
  price: number;
}

// Define the schema
const DataSchema: Schema<Service> = new mongoose.Schema(
  {
    type: { type: String },
    category: { type: String },
    servicename: { type: String },
    price: { type: Number },
    current_branch_id: [{ type: mongoose.Types.ObjectId, required: true }],
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const ServiceModel: Model<Service> =
  mongoose.models.services || mongoose.model<Service>("services", DataSchema);

// Export the model
export default ServiceModel;
