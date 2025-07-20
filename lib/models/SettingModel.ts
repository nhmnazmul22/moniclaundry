import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBusinessSettings extends Document {
  business_name: string;
  business_phone: string;
  business_email: string;
  business_website: string;
  business_address: string;

  original_receipt_show_logo: boolean;
  original_receipt_show_qr: boolean;
  original_receipt_terms_condition_1: string;
  original_receipt_terms_condition_2: string;
  original_receipt_customer_service: string;
  original_receipt_hashtag: string;
  original_show_estimated_completion: boolean;
  original_show_customer_deposit: boolean;

  payment_receipt_header: string;
  payment_receipt_show_logo: boolean;
  payment_receipt_terms_condition_1: string;
  payment_receipt_terms_condition_2: string;
  payment_receipt_customer_service: string;
  payment_receipt_hashtag: string;
  payment_show_estimated_completion: boolean;
  payment_show_customer_deposit: boolean;

  internal_print_header: string;
  internal_print_show_logo: boolean;
  internal_print_show_prices: boolean;
  internal_print_show_payment_info: boolean;
  internal_print_free_text: string;
  internal_show_estimated_completion: boolean;
  internal_show_customer_deposit: boolean;

  current_branch_id?: string;
}

const businessSettingsSchema = new Schema<IBusinessSettings>(
  {
    business_name: { type: String, required: true },
    business_phone: String,
    business_email: String,
    business_website: String,
    business_address: String,

    original_receipt_show_logo: Boolean,
    original_receipt_show_qr: Boolean,
    original_receipt_terms_condition_1: String,
    original_receipt_terms_condition_2: String,
    original_receipt_customer_service: String,
    original_receipt_hashtag: String,
    original_show_estimated_completion: Boolean,
    original_show_customer_deposit: Boolean,

    payment_receipt_header: String,
    payment_receipt_show_logo: Boolean,
    payment_receipt_terms_condition_1: String,
    payment_receipt_terms_condition_2: String,
    payment_receipt_customer_service: String,
    payment_receipt_hashtag: String,
    payment_show_estimated_completion: Boolean,
    payment_show_customer_deposit: Boolean,

    internal_print_header: String,
    internal_print_show_logo: Boolean,
    internal_print_show_prices: Boolean,
    internal_print_show_payment_info: Boolean,
    internal_show_estimated_completion: Boolean,
    internal_show_customer_deposit: Boolean,

    current_branch_id: { type: mongoose.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

const BusinessSettings: Model<IBusinessSettings> =
  mongoose.models.appsettings ||
  mongoose.model<IBusinessSettings>("appsettings", businessSettingsSchema);

export default BusinessSettings;
