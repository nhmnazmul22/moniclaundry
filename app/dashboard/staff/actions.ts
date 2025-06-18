"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Skema validasi menggunakan Zod
const CreateStaffSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter."),
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  phone: z.string().optional(),
  role: z.enum(["owner", "admin", "kurir"], {
    errorMap: () => ({ message: "Pilih role yang valid." }),
  }),
  isActive: z.string(),
})

export async function createStaffAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  // 1. Validasi data dari form
  const validatedFields = CreateStaffSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      message: "Data tidak valid. Silakan periksa kembali.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { fullName, email, password, phone, role, isActive } = validatedFields.data

  // 2. Buat user di Supabase Auth (membutuhkan akses admin, makanya di server)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Langsung konfirmasi email user
    user_metadata: { full_name: fullName, role },
  })

  if (authError) {
    console.error("Supabase Auth Error:", authError)
    return { message: `Gagal membuat akun: ${authError.message}` }
  }

  // 3. Simpan profil user ke tabel 'users' kita
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id, // Gunakan ID dari user yang baru dibuat di Auth
    full_name: fullName,
    email,
    phone: phone || null,
    role,
    is_active: isActive === "true",
  })

  if (profileError) {
    console.error("Supabase Profile Error:", profileError)
    // Jika gagal simpan profil, hapus user yang sudah terlanjur dibuat di Auth
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { message: `Gagal menyimpan profil: ${profileError.message}` }
  }

  // 4. Berhasil! Revalidasi halaman staff untuk menampilkan data baru
  revalidatePath("/dashboard/staff")
  return { success: true, message: "Staff baru berhasil ditambahkan." }
}
