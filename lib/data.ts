import type { Database } from "@/types/database";
import { supabase } from "./supabase/client";

type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  customer: Database["public"]["Tables"]["customers"]["Row"];
  order_items: (Database["public"]["Tables"]["order_items"]["Row"] & {
    service: Database["public"]["Tables"]["services"]["Row"];
  })[];
};

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type InventoryItem = Database["public"]["Tables"]["inventory"]["Row"];
type Delivery = Database["public"]["Tables"]["deliveries"]["Row"];
type Payment = Database["public"]["Tables"]["payments"]["Row"];
type Staff = Database["public"]["Tables"]["users"]["Row"];

export async function getDashboardStats(branchId?: string) {
  try {
    let ordersQuery = supabase.from("orders").select("*");
    let customerQuery = supabase.from("customers").select("*");
    let paymentQuery = supabase.from("payments").select("*");

    if (branchId) {
      ordersQuery = ordersQuery.eq("current_branch_id", branchId);
      customerQuery = customerQuery.eq("current_branch_id", branchId);
      paymentQuery = paymentQuery.eq("current_branch_id", branchId);
    }

    const [ordersResult, customersResult, paymentsResult] = await Promise.all([
      ordersQuery,
      customerQuery,
      paymentQuery,
    ]);

    if (ordersResult.error) throw ordersResult.error;
    if (customersResult.error) throw customersResult.error;
    if (paymentsResult.error) throw paymentsResult.error;

    const orders = ordersResult.data || [];
    const customers = customersResult.data || [];
    const payments = paymentsResult.data || [];

    const totalRevenue = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    const today = new Date().toISOString().split("T")[0];
    const todayRevenue = payments
      .filter(
        (p) => p.created_at?.startsWith(today) && p.status === "completed"
      )
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      totalCustomers: customers.length,
      todayRevenue,
      recentOrders: orders.slice(0, 5),
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

export async function getOrders(branchId: string) {
  try {
    let query = supabase
      .from("orders")
      .select(
        `
        *,
        customer:customers(*),
        order_items(
          *,
          service:services(*)
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply Branch id
    if (branchId) {
      query = query.eq("current_branch_id", branchId);
    }

    const { data, error } = await query;
    console.log(data);
    if (error) throw error;
    return data as Order[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function getCustomers(branchId: string, searchTerm: string) {
  try {
    let query = supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply Branch id
    if (branchId) {
      query = query.eq("current_branch_id", branchId);
    }

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      query = query.or(
        `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Customer[];
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
}

export async function getServices(branchId: string) {
  try {
    let query = supabase
      .from("services")
      .select("*")
      .order("name", { ascending: true });

    // Apply Branch id
    if (branchId) {
      query = query.eq("current_branch_id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Service[];
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

export async function getInventory() {
  try {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data as InventoryItem[];
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
}

export async function getDeliveries(
  searchTerm?: string,
  statusFilter?: string
) {
  try {
    console.log("Fetching deliveries...");

    // Simple query first to test if table exists
    const { data, error } = await supabase
      .from("deliveries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      // Return empty array instead of throwing to prevent page crash
      return [];
    }

    console.log("Deliveries data:", data);
    return data || [];
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
}

export async function getPayments() {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        order:orders(
          *,
          customer:customers(*)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
}

export async function getStaff(searchTerm?: string, roleFilter?: string) {
  try {
    let query = supabase.from("users").select("*");

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      query = query.or(
        `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
      );
    }

    // Apply role filter
    if (roleFilter && roleFilter !== "all") {
      query = query.eq("role", roleFilter);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data as Staff[];
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
}

// CRUD Operations
export async function createOrder(orderData: any) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function updateOrder(id: string, orderData: any) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update(orderData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

export async function deleteOrder(id: string) {
  try {
    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}

export async function createCustomer(customerData: any) {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert(customerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

export async function updateCustomer(id: string, customerData: any) {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
}

export async function deleteCustomer(id: string) {
  try {
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
}

export async function createDelivery(deliveryData: any) {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .insert(deliveryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating delivery:", error);
    throw error;
  }
}

export async function updateDelivery(id: string, deliveryData: any) {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .update(deliveryData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating delivery:", error);
    throw error;
  }
}

export async function deleteDelivery(id: string) {
  try {
    const { error } = await supabase.from("deliveries").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting delivery:", error);
    throw error;
  }
}
