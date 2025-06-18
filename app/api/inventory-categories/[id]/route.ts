import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("inventory_categories")
      .update({
        name: body.name,
        description: body.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating category:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in categories PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if category is being used by any inventory items
    const { data: inventoryItems, error: checkError } = await supabase
      .from("inventory")
      .select("id")
      .eq("category_id", params.id)

    if (checkError) {
      console.error("Error checking category usage:", checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (inventoryItems && inventoryItems.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category that is being used by inventory items",
        },
        { status: 400 },
      )
    }

    const { error } = await supabase.from("inventory_categories").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting category:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in categories DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
