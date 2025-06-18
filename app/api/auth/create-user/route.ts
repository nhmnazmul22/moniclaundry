import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, role } = await request.json()

    console.log("Creating user:", { email, full_name, role })

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm email
      user_metadata: {
        full_name,
        role,
      },
    })

    if (authError) {
      console.error("Auth creation error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log("Auth user created:", authData.user?.id)

    // 2. Update or create staff record
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .upsert({
        id: authData.user!.id,
        email,
        full_name,
        role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (staffError) {
      console.error("Staff creation error:", staffError)
      // If staff creation fails, we should delete the auth user
      await supabase.auth.admin.deleteUser(authData.user!.id)
      return NextResponse.json({ error: staffError.message }, { status: 400 })
    }

    console.log("Staff record created:", staffData)

    return NextResponse.json({
      success: true,
      user: authData.user,
      staff: staffData,
    })
  } catch (error: any) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
