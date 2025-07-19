import mongoose, { Schema, model, Document, Model } from "mongoose";

export interface IBusinessSettings extends Document {
  business_name: string;
  business_phone: string;
  business_email: string;
  business_website: string;
  business_address: string;
  tax_rate: number;
  tax_enabled: boolean;
  invoice_prefix: string;
  currency: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  auto_backup: boolean;
  backup_frequency: "daily" | "weekly" | "monthly";
  original_receipt_header: string;
  original_receipt_footer: string;
  original_receipt_show_logo: boolean;
  original_receipt_show_qr: boolean;
  original_receipt_terms_condition_1: string;
  original_receipt_terms_condition_2: string;
  original_receipt_customer_service: string;
  original_receipt_hashtag: string;
  original_receipt_additional_info: string;

  payment_receipt_header: string;
  payment_receipt_show_logo: boolean;
  payment_receipt_show_transaction_details: boolean;
  payment_receipt_show_kasir_name: boolean;
  payment_receipt_kasir_name: string;
  payment_receipt_terms_condition_1: string;
  payment_receipt_terms_condition_2: string;
  payment_receipt_customer_service: string;
  payment_receipt_hashtag: string;
  payment_receipt_free_text: string;

  internal_print_header: string;
  internal_print_show_logo: boolean;
  internal_print_show_prices: boolean;
  internal_print_show_payment_info: boolean;
  internal_print_free_text: string;

  show_estimated_completion: boolean;
  show_customer_deposit: boolean;

  date_format: string;
  createdAt: Date;
  updatedAt: Date;
}

const businessSettingsSchema = new Schema<IBusinessSettings>(
  {
    business_name: { type: String, required: true },
    business_phone: String,
    business_email: String,
    business_website: String,
    business_address: String,

    tax_rate: Number,
    tax_enabled: Boolean,

    invoice_prefix: String,
    currency: String,
    email_notifications: Boolean,
    sms_notifications: Boolean,
    auto_backup: Boolean,
    backup_frequency: { type: String, enum: ["daily", "weekly", "monthly"] },

    original_receipt_header: String,
    original_receipt_footer: String,
    original_receipt_show_logo: Boolean,
    original_receipt_show_qr: Boolean,
    original_receipt_terms_condition_1: String,
    original_receipt_terms_condition_2: String,
    original_receipt_customer_service: String,
    original_receipt_hashtag: String,
    original_receipt_additional_info: String,

    payment_receipt_header: String,
    payment_receipt_show_logo: Boolean,
    payment_receipt_show_transaction_details: Boolean,
    payment_receipt_show_kasir_name: Boolean,
    payment_receipt_kasir_name: String,
    payment_receipt_terms_condition_1: String,
    payment_receipt_terms_condition_2: String,
    payment_receipt_customer_service: String,
    payment_receipt_hashtag: String,
    payment_receipt_free_text: String,

    internal_print_header: String,
    internal_print_show_logo: Boolean,
    internal_print_show_prices: Boolean,
    internal_print_show_payment_info: Boolean,
    internal_print_free_text: String,

    show_estimated_completion: Boolean,
    show_customer_deposit: Boolean,

    date_format: String,
  },
  {
    timestamps: true,
  }
);

const BusinessSettings: Model<IBusinessSettings> =
  mongoose.models.appsettings ||
  mongoose.model<IBusinessSettings>("appsettings", businessSettingsSchema);

export default BusinessSettings;
