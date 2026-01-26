import mongoose, { type Document, type Model, type Schema } from "mongoose";

export interface ExpenseCategoryType extends Document {
  category: string;
}

const ExpenseCategorySchema: Schema<ExpenseCategoryType> = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false }
);

const ExpenseCategoryModel: Model<ExpenseCategoryType> =
  mongoose.models.expenses_category ||
  mongoose.model<ExpenseCategoryType>(
    "expenses_category",
    ExpenseCategorySchema
  );

export default ExpenseCategoryModel;
