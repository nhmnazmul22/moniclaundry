import mongoose, { Document, Model, Schema } from "mongoose";

export interface Branch extends Document {
  code: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  is_active?: boolean;
}

const BranchSchema: Schema<Branch> = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

const BranchModel: Model<Branch> =
  mongoose.models.branches || mongoose.model<Branch>("branches", BranchSchema);

export default BranchModel;
