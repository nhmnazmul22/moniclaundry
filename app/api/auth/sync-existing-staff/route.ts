import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Get all active staff without auth accounts
    const { data: staffList, error: staffError } = await supabase.from("staff").select("*").eq("is_active", true)

    if (staffError) {
      return NextResponse.json({ error: staffError.message }, { status: 400 })
    }

    const results = []

    for (const staff of staffList || []) {
      try {
        // Check if auth user already exists
        const { data: existingUser } = await supabase.auth.admin.getUserById(staff.id)

        if (existingUser.user) {
          results.push({
            email: staff.email,
            status: "already_exists",
            auth_id: existingUser.user.id,
          })
          continue
        }

        // Create auth user with default password
        const defaultPassword = "admin123" // You should change this

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: staff.email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            full_name: staff.full_name,
            role: staff.role,
          },
        })

        if (authError) {
          results.push({
            email: staff.email,
            status: "error",
            error: authError.message,
          })
          continue
        }

        // Update staff record with new auth ID
        await supabase
          .from("staff")
          .update({
            id: authData.user!.id,
            updated_at: new Date().toISOString(),
          })
          .eq("email", staff.email)

        results.push({
          email: staff.email,
          status: "created",
          auth_id: authData.user!.id,
          default_password: defaultPassword,
        })
      } catch (error: any) {
        results.push({
          email: staff.email,
          status: "error",
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: "Sync completed. Check results for each user.",
    })
  } catch (error: any) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
