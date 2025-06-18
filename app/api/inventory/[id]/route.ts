import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("inventory")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating inventory item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in inventory PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("inventory").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting inventory item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in inventory DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
