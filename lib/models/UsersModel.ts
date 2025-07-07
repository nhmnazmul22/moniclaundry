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
  is_active?: Boolean;
  current_branch_id?: ObjectId[];
}

// Define the schema
const DataSchema: Schema<Users> = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "kurir", "kasir"],
      required: true,
    },
    phone: { type: String },
    address: { type: String },
    avatar_url: { type: String },
    is_active: { type: Boolean, default: true },
    current_branch_id: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        message: "Branch Id is required",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const UsersModel: Model<Users> =
  mongoose.models.users || mongoose.model<Users>("users", DataSchema);

// Export the model
export default UsersModel;
