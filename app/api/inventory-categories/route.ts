import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  try {
    const { data, error } = await supabase.from("inventory_categories").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Error in categories GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("inventory_categories")
      .insert({
        name: body.name,
        description: body.description || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in categories POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
