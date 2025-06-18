import { supabase } from "./supabase/client"

export interface StaffMember {
  id: string
  full_name: string
  email: string
  phone?: string
  role: "owner" | "admin" | "kurir"
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getStaffList(searchTerm?: string, roleFilter?: string) {
  try {
    let query = supabase.from("staff").select("*")

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
    }

    // Apply role filter
    if (roleFilter && roleFilter !== "all") {
      query = query.eq("role", roleFilter)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching staff:", error)
      throw error
    }

    return data as StaffMember[]
  } catch (error) {
    console.error("Error in getStaffList:", error)
    throw error
  }
}

export async function getStaffFromStaffTable(searchTerm?: string, roleFilter?: string) {
  try {
    let query = supabase.from("staff").select("*")

    if (searchTerm && searchTerm.trim()) {
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
    }

    if (roleFilter && roleFilter !== "all") {
      query = query.eq("role", roleFilter)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching staff from staff table:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getStaffFromStaffTable:", error)
    return []
  }
}

export async function createStaffMember(staffData: {
  full_name: string
  email: string
  phone?: string
  role: "owner" | "admin" | "kurir"
  password: string
  is_active: boolean
}) {
  try {
    console.log("Creating staff member:", staffData)

    if (!staffData.full_name || !staffData.email || !staffData.role || !staffData.password) {
      throw new Error("Semua field wajib harus diisi")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(staffData.email)) {
      throw new Error("Format email tidak valid")
    }

    if (staffData.password.length < 6) {
      throw new Error("Password minimal 6 karakter")
    }

    const { data: existingStaff, error: checkError } = await supabase
      .from("staff")
      .select("id")
      .eq("email", staffData.email.toLowerCase().trim())
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing staff:", checkError)
      throw new Error("Gagal memeriksa email yang sudah ada")
    }

    if (existingStaff) {
      throw new Error("Email sudah digunakan oleh staff lain")
    }

    const newStaffData = {
      full_name: staffData.full_name.trim(),
      email: staffData.email.toLowerCase().trim(),
      phone: staffData.phone?.trim() || null,
      role: staffData.role,
      is_active: staffData.is_active,
      password_hash: `hashed_${staffData.password}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("staff").insert(newStaffData).select().single()

    if (error) {
      console.error("Supabase insert error:", error)
      throw new Error(`Gagal menambahkan staff: ${error.message}`)
    }

    console.log("Staff created successfully:", data)
    return data
  } catch (error: any) {
    console.error("Error in createStaffMember:", error)
    throw error
  }
}

export async function updateStaffMember(id: string, staffData: Partial<StaffMember>) {
  try {
    const updateData = {
      ...staffData,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("staff").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Supabase update error:", error)
      throw new Error(`Gagal memperbarui staff: ${error.message}`)
    }

    return data
  } catch (error: any) {
    console.error("Error in updateStaffMember:", error)
    throw error
  }
}

export async function deleteStaffMember(id: string) {
  try {
    const { data, error } = await supabase
      .from("staff")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase deactivate error:", error)
      throw new Error(`Gagal menonaktifkan staff: ${error.message}`)
    }

    return data
  } catch (error: any) {
    console.error("Error in deleteStaffMember:", error)
    throw error
  }
}
