export interface User {
  _id?: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "kurir";
  phone?: string;
  address?: string;
  avatar_url?: string;
  is_active: boolean;
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

export interface InventoryItem {
  id: string;
  item_name: string;
  category?: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit?: string;
  cost_per_unit?: number;
  selling_price?: number;
  supplier?: string;
  last_restock?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
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
  category:
    | "Aqua"
    | "Bensin Kurir"
    | "Bensin Mobil"
    | "Gas"
    | "Kasbon"
    | "Kebutuhan Laundry"
    | "Lainnya"
    | "Lembur"
    | "Medis"
    | "Traktir Karyawan"
    | "Uang Training";
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
