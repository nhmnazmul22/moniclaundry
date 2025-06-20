import { supabase } from "@/lib/supabase";
import { Branches } from "@/types/database";

export async function getBranchList() {
  try {
    let { data: branches, error } = await supabase.from("branches").select("*");

    if (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
    console.log(branches);
    return branches as Branches[];
  } catch (error) {
    console.error("Error in getBranchList:", error);
    throw error;
  }
}
