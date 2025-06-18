"use server"

import { supabase } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"

export async function addCustomer(formData: FormData) {
  const { data, error } = await supabase
    .from("customers")
    .insert([
      {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        address: formData.get("address") as string,
      },
    ])
    .single()

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/customers")
  return { success: true, message: "Customer added successfully", data }
}

export async function updateCustomer(id: string, formData: FormData) {
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
    })
    .eq("id", id)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/customers")
  return { success: true, message: "Customer updated successfully" }
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/customers")
  return { success: true, message: "Customer deleted successfully" }
}
