export interface User {
  _id?: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "kurir" | "kasir";
  phone?: string;
  address?: string;
  avatar_url?: string;
  is_active: boolean;
  current_branch_id: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  current_branch_id?: string;
  total_orders: number;
  total_spent: number;
  total_deposit: number;
  // New deposit-related fields
  deposit_balance?: number;
  deposit_type?: string;
  deposit_type_id?: string;
  has_expiry?: boolean;
  expiry_date?: Date;
  is_active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id?: string;
  type?: string;
  category: string;
  servicename: string;
  price: number;
  current_branch_id: [string];
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  order_number: string;
  total_weight: number;
  total_unit: number;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  payment_method?: "cash" | "transfer" | "qris" | "deposit";
  payment_status: "lunas" | "belum lunas" | "dp";
  order_status: "diterima" | "diproses" | "selesai";
  pickup_date?: string;
  delivery_date?: string;
  estimated_completion?: string;
  notes?: string;
  special_instructions?: string;
  created_By: User;
  customerDetails?: Customer;
  current_branch_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  _id: string;
  service_id?: string;
  orderDetails: Order;
  serviceDetails: Service;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  current_branch_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Delivery {
  _id: string;
  order_id: string;
  kurir_id: string;
  delivery_type: "pickup" | "delivery";
  scheduled_time: string;
  actual_time?: string;
  status: string;
  customer?: Customer;
  delivery_fee: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  orderDetails?: Order;
  current_branch_id?: string;
  kurirDetails?: User;
  order?: Order;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  bank_name?: string;
  account_number?: string;
  notes?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  created_by: string;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  category?: string;
  updated_by?: string;
  updated_at: string;
}

export interface DashboardSummaryData {
  salesData: {
    totalRevenue: number;
    paidAmount: number;
    outstandingAmount: number;
    expenses: number;
    netCash: number;
  };

  laundryData: {
    totalKg: number;
    totalUnits: number;
  };

  transactionData: {
    totalTransactions: number;
    paymentMethods: {
      type: "cash" | "qris" | "transfer" | "deposit";
      count: number;
      amount: number;
    }[];
    regularTransactions: number;
    cancelledTransactions: number;
  };

  depositData: {
    topUpCount: number;
    topUpUsers: number;
    totalTopUpValue: number;
  };

  customerData: {
    existingCustomers: number;
    newCustomers: number;
  };
}

export interface Branches {
  _id: string;
  code: string;
  name: string;
  type: string;
  is_active: string;
  address?: string;
  phone?: string;
  database_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DepositType {
  _id?: string;
  name: string;
  purchase_price: number;
  deposit_value: number;
  current_branch_id: string;
  description?: string;
  is_active?: boolean;
}

export interface Transaction {
  _id?: string;
  customer_id: string;
  current_branch_id: string;
  amount: number;
  type: "laundry" | "deposit_purchase" | "refund" | "adjustment";
  payment_method: "deposit" | "cash" | "transfer" | "qris" | "mixed";
  deposit_amount?: number;
  cash_amount?: number;
  status: "completed" | "cancelled" | "pending";
  description?: string;
  reference_id?: string;
  processed_by?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DepositReportData {
  summary: {
    total_deposit_balance: number;
    total_deposits_purchased: number;
    active_customers: number;
    expiring_deposits_count: number;
  };
  today_stats: Array<{
    _id: string;
    count: number;
    total_amount: number;
  }>;
  expiring_deposits: Customer[];
  transaction_summary: Array<{
    _id: string;
    count: number;
    total_amount: number;
  }>;
  payment_method_summary: Array<{
    _id: string;
    count: number;
    total_amount: number;
    deposit_used: number;
    cash_collected: number;
  }>;
  top_customers: Customer[];
  monthly_revenue: Array<{
    _id: { year: number; month: number; type: string };
    revenue: number;
    transactions: number;
  }>;
  deposit_type_performance: Array<{
    _id: string;
    name: string;
    purchase_price: number;
    deposit_value: number;
    total_purchases: number;
    total_revenue: number;
  }>;
  total_deposit_balance?: number;
  today_transactions_count?: number;
}

export interface CustomerTransactionReport {
  cif: string;
  nama: string;
  tanggalCuciAwal: string;
  jumlahDeposit: number;
  saldoDeposit: number;
  jumlahTransaksi: number;
  nilaiTransaksi: number;
  jumlahTransaksiKiloan: number;
  jumlahTransaksiSatuan: number;
}

export interface Expense {
  _id?: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  current_branch_id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SalesReportItem {
  tanggalTransaksi: string;
  nomorTransaksi: string;
  namaPelanggan: string;
  kilogramKategori: string;
  kilogramJenis: string;
  kilogramTotal: string | number;
  kilogramHarga: string;
  satuanKategori: string;
  satuanLayanan: string;
  satuanTotal: string | number;
  satuanHarga: string;
  meterKategori: string;
  meterLayanan: string;
  meterTotal: string | number;
  meterHarga: string;
  statusPembayaran: string;
  hargaPenjualan: string;
  metodePembayaran: string;
}

export interface NotificationType {
  _id?: string;
  title: string;
  description: string;
  status: string;
  current_branch_id?: string;
  createAt?: string;
  updatedAt?: string;
}

export interface SalesReportData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  growthRate?: number;
  dailyBreakdown: Array<{
    date: string;
    revenue: number;
    orders: number;
    avgPerOrder: number;
  }>;
  topServices?: Array<{ name: string; count: number; revenue: number }>;
  paymentMethods?: { [key: string]: number };
  salesData: {
    rupiah: number;
    kilo: number;
    satuan: number;
  };
  paymentBreakdown: {
    cash: { transactions: number; amount: number };
    transfer: { transactions: number; amount: number };
    qris: { transactions: number; amount: number };
    deposit: { transactions: number; amount: number };
  };
  expenses: {
    total: number;
    transaction: number;
  };
  netCash: number;
  transactionCounts: {
    kilo: number;
    satuan: number;
  };
  depositData: {
    topUp: { transactions: number; amount: number };
    usage: { transactions: number; amount: number };
  };
  customerData: {
    new: number;
    existing: number;
  };
  serviceBreakdown: {
    kiloan: {
      regular: Array<{ service: string; kilo: number; amount: number }>;
      express: Array<{ service: string; kilo: number; amount: number }>;
    };
    satuan: Array<{ item: string; count: number; amount: number }>;
  };
}

export interface BusinessSetting {
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
