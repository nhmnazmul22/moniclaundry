import { supabase } from "@/lib/supabase/client";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, oldName } = body;

    console.log("Updating category:", { id, name, description, oldName });

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if another category with the same name exists
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("name", name.trim())
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Another category with this name already exists" },
        { status: 400 }
      );
    }

    // Update category
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        {
          error: "Failed to update category",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Update inventory items if category name changed
    if (oldName && oldName !== name.trim()) {
      console.log("Updating inventory items from", oldName, "to", name.trim());
      const { error: inventoryError } = await supabase
        .from("inventory")
        .update({ category: name.trim() })
        .eq("category", oldName);

      if (inventoryError) {
        console.error("Error updating inventory items:", inventoryError);
      }
    }

    console.log("Category updated successfully:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log("Deleting category:", id);

    // Get category name before deleting
    const { data: category } = await supabase
      .from("categories")
      .select("name")
      .eq("id", id)
      .single();

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Delete the category
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        {
          error: "Failed to delete category",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Update inventory items to "Uncategorized"
    console.log(
      "Updating inventory items to Uncategorized for category:",
      category.name
    );
    const { error: inventoryError } = await supabase
      .from("inventory")
      .update({ category: "Uncategorized" })
      .eq("category", category.name);

    if (inventoryError) {
      console.error("Error updating inventory items:", inventoryError);
    }

    console.log("Category deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
