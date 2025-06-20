"use server";

import { supabase } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

const parseServiceFormData = (formData: FormData) => ({
  name: formData.get("name") as string,
  description: formData.get("description") as string,
  price_per_kg: Number(formData.get("price_per_kg")),
  min_weight: Number(formData.get("min_weight")),
  estimated_hours: Number(formData.get("estimated_hours")),
  category: formData.get("category") as string,
  is_active: formData.get("is_active") === "on",
  current_branch_id: formData.get("current_branch_id") as string,
});

export async function addService(formData: FormData) {
  try {
    const serviceData = parseServiceFormData(formData);
    const { error } = await supabase.from("services").insert([serviceData]);

    if (error) {
      console.error("Error adding service:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/dashboard/services");
    return { success: true, message: "Service berhasil ditambahkan." };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "Terjadi kesalahan yang tidak terduga." };
  }
}

export async function updateService(id: string, formData: FormData) {
  try {
    const serviceData = parseServiceFormData(formData);
    const { error } = await supabase
      .from("services")
      .update(serviceData)
      .eq("id", id);

    if (error) {
      console.error("Error updating service:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/dashboard/services");
    return { success: true, message: "Service berhasil diperbarui." };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "Terjadi kesalahan yang tidak terduga." };
  }
}

export async function deleteService(id: string) {
  try {
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      console.error("Error deleting service:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/dashboard/services");
    return { success: true, message: "Service berhasil dihapus." };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "Terjadi kesalahan yang tidak terduga." };
  }
}
