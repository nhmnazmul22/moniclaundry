// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface for the data
export interface StaffAuth extends Document {
  staff_email: string;
  staff_name: string;
  staff_role: string;
  auth_created: string;
  current_branch_id?: ObjectId;
}

// Define the schema
const DataSchema: Schema<StaffAuth> = new mongoose.Schema(
  {
    staff_email: { type: String, required: true },
    staff_name: { type: String, required: true },
    staff_role: { type: String, required: true },
    auth_created: { type: String, required: true },
    current_branch_id: { type: mongoose.Types.ObjectId },
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const StaffAuthModel: Model<StaffAuth> =
  mongoose.models.staffauthsync ||
  mongoose.model<StaffAuth>("staffauthsync", DataSchema);

// Export the model
export default StaffAuthModel;
