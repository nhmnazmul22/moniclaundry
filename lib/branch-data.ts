import { supabase } from "@/lib/supabase/client";
import type { Branches } from "@/types";

export async function getBranchList(): Promise<Branches[] | null> {
  try {
    const { data: branches, error } = await supabase
      .from("branches")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching branches:", error);
      return null;
    }

    return branches as Branches[];
  } catch (error) {
    console.error("Error in getBranchList:", error);
    return null;
  }
}

export async function createBranch(
  branch: Omit<Branches, "id" | "created_at" | "updated_at">
) {
  try {
    const { data, error } = await supabase
      .from("branches")
      .insert([branch])
      .select()
      .single();

    if (error) {
      console.error("Error creating branch:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createBranch:", error);
    throw error;
  }
}
