import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase" // Mengimpor dari lib/supabase.ts

export const dynamic = "force-static"
export const revalidate = false

export async function POST(request: NextRequest) {
  try {
    const { type, data, userId } = await request.json()

    switch (type) {
      case "location_update":
        await handleLocationUpdate(data, userId)
        break
      case "order_status_update":
        await handleOrderStatusUpdate(data, userId)
        break
      case "delivery_update":
        await handleDeliveryUpdate(data, userId)
        break
      default:
        return NextResponse.json({ error: "Unknown sync type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}

async function handleLocationUpdate(locationData: any, userId: string) {
  const { latitude, longitude, accuracy, timestamp } = locationData

  // Update kurir location in database
  await supabase.from("user_locations").upsert({
    user_id: userId,
    latitude,
    longitude,
    accuracy,
    updated_at: new Date(timestamp).toISOString(),
  })

  // Update active deliveries with current location
  await supabase
    .from("deliveries")
    .update({
      gps_lat: latitude,
      gps_lng: longitude,
      updated_at: new Date().toISOString(),
    })
    .eq("kurir_id", userId)
    .eq("status", "in_progress")
}

async function handleOrderStatusUpdate(orderData: any, userId: string) {
  const { orderId, status, notes } = orderData

  await supabase
    .from("orders")
    .update({
      order_status: status,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)

  // Log the status change
  await supabase.from("audit_logs").insert({
    user_id: userId,
    action: "order_status_update",
    table_name: "orders",
    record_id: orderId,
    new_values: { order_status: status, notes },
    created_at: new Date().toISOString(),
  })
}

async function handleDeliveryUpdate(deliveryData: any, userId: string) {
  const { deliveryId, status, proofPhotoUrl, customerSignatureUrl, notes } = deliveryData

  await supabase
    .from("deliveries")
    .update({
      status,
      proof_photo_url: proofPhotoUrl,
      customer_signature_url: customerSignatureUrl,
      notes,
      actual_time: status === "completed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deliveryId)
    .eq("kurir_id", userId)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const type = searchParams.get("type")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    let data = {}

    switch (type) {
      case "deliveries":
        data = await getKurirDeliveries(userId)
        break
      case "orders":
        data = await getActiveOrders()
        break
      case "notifications":
        data = await getUserNotifications(userId)
        break
      default:
        return NextResponse.json({ error: "Unknown data type" }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Sync GET error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

async function getKurirDeliveries(userId: string) {
  const { data, error } = await supabase
    .from("deliveries")
    .select(`
      *,
      order:orders(
        *,
        customer:customers(name, phone, address)
      )
    `)
    .eq("kurir_id", userId)
    .in("status", ["scheduled", "in_progress"])
    .order("scheduled_time", { ascending: true })

  if (error) throw error
  return { deliveries: data }
}

async function getActiveOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(name, phone),
      order_items(
        *,
        service:services(name)
      )
    `)
    .not("order_status", "in", '("delivered", "cancelled")')
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) throw error
  return { orders: data }
}

async function getUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) throw error
  return { notifications: data }
}
