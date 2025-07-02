import mongoose, {
  type Document,
  type Model,
  type ObjectId,
  type Schema,
} from "mongoose";

export interface DepositType extends Document {
  name: string;
  purchase_price: number;
  deposit_value: number;
  branch_id: ObjectId;
  description?: string;
  is_active?: boolean;
}

const DepositTypeSchema: Schema<DepositType> = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    purchase_price: { type: Number, required: true, min: 0 },
    deposit_value: { type: Number, required: true, min: 0 },
    branch_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "branches",
    },
    description: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// Compound index for unique deposit type per branch
DepositTypeSchema.index({ name: 1, branch_id: 1 }, { unique: true });
DepositTypeSchema.index({ branch_id: 1, is_active: 1 });

const DepositTypeModel: Model<DepositType> =
  mongoose.models.deposit_types ||
  mongoose.model<DepositType>("deposit_types", DepositTypeSchema);

export default DepositTypeModel;
