import type { User as AppUser, Customer, Service, Order, DashboardStats } from "@/types/database"

// Demo users
export const demoUsers: AppUser[] = [
  {
    id: "demo-owner-1",
    email: "owner@moniclaundry.com",
    full_name: "John Owner",
    role: "owner",
    phone: "081234567890",
    address: "Jl. Owner No. 1",
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-admin-1",
    email: "admin@moniclaundry.com",
    full_name: "Jane Admin",
    role: "admin",
    phone: "081234567891",
    address: "Jl. Admin No. 2",
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-kurir-1",
    email: "kurir@moniclaundry.com",
    full_name: "Bob Kurir",
    role: "kurir",
    phone: "081234567892",
    address: "Jl. Kurir No. 3",
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Demo customers
export const demoCustomers: Customer[] = [
  {
    id: "demo-customer-1",
    name: "Budi Santoso",
    phone: "081234567890",
    email: "budi@email.com",
    address: "Jl. Merdeka No. 123, Jakarta",
    loyalty_points: 150,
    total_orders: 5,
    total_spent: 250000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-customer-2",
    name: "Siti Nurhaliza",
    phone: "081234567891",
    email: "siti@email.com",
    address: "Jl. Sudirman No. 456, Jakarta",
    loyalty_points: 200,
    total_orders: 8,
    total_spent: 400000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Demo services
export const demoServices: Service[] = [
  {
    id: "demo-service-1",
    name: "Cuci Kering Reguler",
    description: "Cuci dan kering standar",
    price_per_kg: 5000,
    min_weight: 1.0,
    estimated_hours: 24,
    category: "regular",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-service-2",
    name: "Cuci Kering Express",
    description: "Cuci dan kering dalam 6 jam",
    price_per_kg: 8000,
    min_weight: 1.0,
    estimated_hours: 6,
    category: "express",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Demo orders
export const demoOrders: Order[] = [
  {
    id: "demo-order-1",
    order_number: "ML240101001",
    customer_id: "demo-customer-1",
    total_weight: 3.5,
    subtotal: 17500,
    discount: 0,
    tax: 1925,
    total_amount: 19425,
    payment_method: "cash",
    payment_status: "paid",
    order_status: "delivered",
    pickup_date: new Date().toISOString(),
    delivery_date: new Date().toISOString(),
    estimated_completion: new Date().toISOString(),
    notes: "Cuci biasa",
    special_instructions: "",
    created_by: "demo-admin-1",
    created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updated_at: new Date().toISOString(),
    customer: demoCustomers[0],
  },
  {
    id: "demo-order-2",
    order_number: "ML240101002",
    customer_id: "demo-customer-2",
    total_weight: 2.0,
    subtotal: 16000,
    discount: 1600,
    tax: 1584,
    total_amount: 15984,
    payment_method: "transfer",
    payment_status: "paid",
    order_status: "washing",
    pickup_date: new Date().toISOString(),
    delivery_date: undefined,
    estimated_completion: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    notes: "Express",
    special_instructions: "Jangan pakai pewangi",
    created_by: "demo-admin-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: demoCustomers[1],
  },
]

// Demo dashboard stats
export const demoDashboardStats: DashboardStats = {
  totalRevenue: 2500000,
  totalOrders: 45,
  pendingOrders: 8,
  completedOrders: 37,
  totalCustomers: 25,
  todayRevenue: 150000,
  todayOrders: 3,
  monthlyRevenue: [120000, 180000, 220000, 190000, 250000, 280000, 320000],
  topServices: [
    { name: "Cuci Kering Reguler", count: 25, revenue: 1250000 },
    { name: "Cuci Kering Express", count: 15, revenue: 960000 },
    { name: "Cuci Setrika", count: 5, revenue: 290000 },
  ],
  recentOrders: demoOrders,
  lowStockItems: [],
}

// Demo authentication
export const demoAuth = {
  currentUser: null as AppUser | null,

  signIn: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = demoUsers.find((u) => u.email === email)
    if (user && password === "password123") {
      demoAuth.currentUser = user
      return { success: true }
    }
    return { error: "Email atau password salah" }
  },

  signOut: async () => {
    demoAuth.currentUser = null
  },

  getUser: () => demoAuth.currentUser,
}
