// Import Mongoose
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// Define the interface for the data
export interface Reports extends Document {
  branch_id?: ObjectId;
  report_type: string;
  report_data: Record<string, any>;
  generated_at?: Date;
  current_branch_id?: ObjectId;
}

// Define the schema
const ReportSchema: Schema<Reports> = new mongoose.Schema(
  {
    branch_id: { type: mongoose.Types.ObjectId },
    report_type: { type: String, required: true },
    report_data: { type: Schema.Types.Mixed, required: true },
    generated_at: { type: Date, default: Date.now },
    current_branch_id: { type: mongoose.Types.ObjectId },
  },
  { timestamps: true, versionKey: false }
);

// Define the model
const ReportsModel: Model<Reports> =
  mongoose.models.reports || mongoose.model<Reports>("reports", ReportSchema);

// Export the model
export default ReportsModel;
