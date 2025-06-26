// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface for the data
export interface Users extends Document {
  email: string;
  password: string;
  full_name: string;
  role: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  isActive?: Boolean;
  current_branch_id?: ObjectId[];
}

// Define the schema
const DataSchema: Schema<Users> = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    avatar_url: { type: String },
    isActive: { type: Boolean, required: true },
    current_branch_id: { type: [mongoose.Types.ObjectId] },
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const SuperUsersModel: Model<Users> =
  mongoose.models.superusers || mongoose.model<Users>("users", DataSchema);

// Export the model
export default SuperUsersModel;
