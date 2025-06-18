import { supabase } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Fetching categories...")

    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch categories",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("Categories fetched successfully:", data)
    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    console.log("Creating category:", { name, description })

    if (!name?.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // Check if category already exists
    const { data: existing } = await supabase.from("categories").select("id").eq("name", name.trim()).maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    // Insert new category
    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: name.trim(),
          description: description?.trim() || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Insert error:", error)
      return NextResponse.json(
        {
          error: "Failed to create category",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("Category created successfully:", data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("POST error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
