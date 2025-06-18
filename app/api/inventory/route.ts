import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let query = supabase.from("inventory").select("*").order("created_at", { ascending: false })

    if (search) {
      query = query.or(`item_name.ilike.%${search}%,supplier.ilike.%${search}%,category.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching inventory:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Error in inventory GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("inventory")
      .insert({
        item_name: body.item_name,
        category: body.category,
        current_stock: Number(body.current_stock),
        min_stock: Number(body.min_stock),
        max_stock: Number(body.max_stock),
        unit: body.unit,
        cost_per_unit: Number(body.cost_per_unit),
        selling_price: Number(body.selling_price),
        supplier: body.supplier,
        expiry_date: body.expiry_date || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating inventory item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in inventory POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
