import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

export interface Notifications extends Document {
  title: string;
  description: string;
  status: string;
  current_branch_id: ObjectId;
}

const NotificationSchema: Schema<Notifications> = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["read", "unread"], required: true },
    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

const NotificationModel: Model<Notifications> =
  mongoose.models.notifications ||
  mongoose.model<Notifications>("notifications", NotificationSchema);

export default NotificationModel;
