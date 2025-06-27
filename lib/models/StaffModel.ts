// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface for the data
export interface Staff extends Document {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  is_Active: boolean;
  current_branch_id: ObjectId;
}

// Define the schema
const DataSchema: Schema<Staff> = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, required: true },
    is_Active: { type: Boolean },
    current_branch_id: { type: mongoose.Types.ObjectId, require: true },
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const StaffModel: Model<Staff> =
  mongoose.models.staffs || mongoose.model<Staff>("staffs", DataSchema);

// Export the model
export default StaffModel;
