"use server";

import api from "@/lib/config/axios";
import { Service } from "@/types";

// Simple JSON import function
export async function importServicesJSON(formData: FormData, branchId: string) {
  try {
    const jsonFile = formData.get("jsonFile") as File;

    if (!jsonFile) {
      return { success: false, message: "No file provided" };
    }

    const jsonText = await jsonFile.text();
    const servicesData: Service = JSON.parse(jsonText);

    const result = await saveServicesToDatabase(servicesData, branchId);

    if (result?.success) {
      return {
        success: true,
        message: "Services imported successfully",
        count:
          Array.isArray(servicesData.services) && servicesData.services?.length,
      };
    } else {
      return { success: false, message: result?.error };
    }
  } catch (error) {
    console.error("JSON import error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Import failed",
    };
  }
}

async function saveServicesToDatabase(
  servicesData: Service,
  branchId?: string
) {
  try {
    const serviceData = {
      name: servicesData.name || "",
      branch_name: servicesData.branch_name || "",
      type: servicesData.type || "",
      current_branch_id: servicesData.current_branch_id || [],
      services: servicesData.services || [],
    };

    const res = await api.post(
      `/api/services?branch_id=${branchId}`,
      serviceData
    );

    if (res.status === 201) {
      console.log("Saving services:", servicesData);
      return { success: true };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database error",
    };
  }
}
