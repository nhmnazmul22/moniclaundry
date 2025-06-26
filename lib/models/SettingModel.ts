import mongoose, { Document, Schema } from "mongoose";

export interface IAppSettings extends Document {
  [key: string]: any;
}

const AppSettingsSchema = new Schema({}, { strict: false });

export default mongoose.model<IAppSettings>("AppSettings", AppSettingsSchema);
