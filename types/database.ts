export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<User>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Customer>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Service>;
      };
      orders: {
        Row: Order;
        Insert: Omit<
          Order,
          | "created_at"
          | "updated_at"
          | "id"
          | "customer"
          | "order_items"
          | "payments"
          | "deliveries"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Order>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id" | "service"> & { id?: string };
        Update: Partial<OrderItem>;
      };
      deliveries: {
        Row: Delivery;
        Insert: Omit<
          Delivery,
          "created_at" | "updated_at" | "kurir" | "order" | "id"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Delivery>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "created_at" | "id"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Payment>;
      };
      inventory: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, "created_at" | "updated_at" | "id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<InventoryItem>;
      };
      settings: {
        Row: Setting;
        Insert: Omit<Setting, "updated_at" | "id"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Setting>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "kurir";
  phone?: string;
  address?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  current_branch_id?: string;
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price_per_kg: number;
  min_weight: number;
  estimated_hours: number;
  category?: string;
  is_active: boolean;
  current_branch_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  total_weight: number;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  payment_method?: "cash" | "transfer" | "ewallet" | "cod";
  payment_status: "pending" | "paid" | "partial" | "refunded";
  order_status:
    | "received"
    | "washing"
    | "drying"
    | "ironing"
    | "ready"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  pickup_date?: string;
  delivery_date?: string;
  estimated_completion?: string;
  notes?: string;
  special_instructions?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  order_items?: OrderItem[];
  payments?: Payment[];
  deliveries?: Delivery[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  service?: Service;
}

export interface Delivery {
  id: string;
  order_id: string;
  kurir_id: string;
  delivery_type: "pickup" | "delivery";
  scheduled_time?: string;
  actual_time?: string;
  status: "scheduled" | "in_progress" | "completed" | "failed" | "cancelled";
  customer_address?: string;
  gps_lat?: number;
  gps_lng?: number;
  proof_photo_url?: string;
  customer_signature_url?: string;
  notes?: string;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
  kurir?: User;
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

export interface DashboardStats {
  totalRevenue?: number;
  totalOrders?: number;
  pendingOrders?: number;
  completedOrders?: number;
  totalCustomers?: number;
  todayRevenue?: number;
  todayOrders?: number;
  monthlyRevenue?: number[];
  topServices?: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  recentOrders?: Order[];
  lowStockItems?: InventoryItem[];
}

export interface Branches {
  id: string;
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
