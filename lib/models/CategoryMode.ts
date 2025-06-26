import mongoose, { Document, Model, Schema } from "mongoose";

export interface SimpleModel extends Document {
  name: string;
  description?: string;
}

const CategorySchema: Schema<SimpleModel> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true, versionKey: false }
);

const CategoryModel: Model<SimpleModel> =
  mongoose.models.categories ||
  mongoose.model<SimpleModel>("categories", CategorySchema);

export default CategoryModel;
