export interface User {
  id: string
  email: string
  full_name: string
  role: "owner" | "admin" | "kurir"
  phone?: string
  address?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  loyalty_points: number
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description?: string
  price_per_kg: number
  min_weight: number
  estimated_hours: number
  category?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  total_weight: number
  subtotal: number
  discount: number
  tax: number
  total_amount: number
  payment_method?: "cash" | "transfer" | "ewallet" | "cod"
  payment_status: "pending" | "paid" | "partial" | "refunded"
  order_status: "received" | "washing" | "drying" | "ironing" | "ready" | "out_for_delivery" | "delivered" | "cancelled"
  pickup_date?: string
  delivery_date?: string
  estimated_completion?: string
  notes?: string
  special_instructions?: string
  created_by: string
  created_at: string
  updated_at: string
  customer?: Customer
  order_items?: OrderItem[]
  payments?: Payment[]
  deliveries?: Delivery[]
}

export interface OrderItem {
  id: string
  order_id: string
  service_id: string
  quantity: number
  unit_price: number
  subtotal: number
  notes?: string
  service?: Service
}

export interface Delivery {
  id: string
  order_id: string
  kurir_id: string
  delivery_type: "pickup" | "delivery"
  scheduled_time?: string
  actual_time?: string
  status: "scheduled" | "in_progress" | "completed" | "failed" | "cancelled"
  customer_address?: string
  gps_lat?: number
  gps_lng?: number
  proof_photo_url?: string
  customer_signature_url?: string
  notes?: string
  delivery_fee: number
  created_at: string
  updated_at: string
  kurir?: User
  order?: Order
}

export interface Payment {
  id: string
  order_id: string
  amount: number
  payment_method: string
  payment_date: string
  reference_number?: string
  bank_name?: string
  account_number?: string
  notes?: string
  status: "pending" | "completed" | "failed" | "cancelled"
  created_by: string
  created_at: string
}

export interface InventoryItem {
  id: string
  item_name: string
  category?: string
  current_stock: number
  min_stock: number
  max_stock: number
  unit?: string
  cost_per_unit?: number
  selling_price?: number
  supplier?: string
  last_restock?: string
  expiry_date?: string
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value?: string
  description?: string
  category?: string
  updated_by?: string
  updated_at: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalCustomers: number
  todayRevenue: number
  todayOrders: number
  monthlyRevenue: number[]
  topServices: Array<{
    name: string
    count: number
    revenue: number
  }>
  recentOrders: Order[]
  lowStockItems: InventoryItem[]
}
