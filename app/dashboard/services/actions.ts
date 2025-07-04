"use server";
import * as XLSX from "xlsx";

import api from "@/lib/config/axios";
import { Branches, Service } from "@/types";

// Simple JSON import function
export async function importServicesJSON(
  formData: FormData,
  branchId: string
): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const excelFile = formData.get("excelFile") as File;
    if (!excelFile) {
      return { success: false, message: "No file provided", count: 0 };
    }

    const data = await excelFile.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawJson: any = XLSX.utils.sheet_to_json(sheet);

    if (rawJson[2].KATEGORI === "Branch Id") {
      return {
        success: false,
        message:
          "You can't update using import excel file, please update manually",
        count: 0,
      };
    }

    const services: Service[] = rawJson.map((row: any) => ({
      type: row.__EMPTY || "Satuan",
      category: row.__EMPTY_1 || "No Category",
      servicename: row.__EMPTY_2 || "No Service Name",
      price: Number(row.__EMPTY_3) || Number("00.00"),
      current_branch_id: [branchId], // attach selected branch
    }));

    const res = await api.post("/api/services/importExcel", services);

    if (res.status === 201) {
      return {
        success: true,
        message: "Services parsed successfully",
        count: services.length,
      };
    }

    return {
      success: false,
      message: "Services parsed failed",
      count: services.length,
    };
  } catch (error) {
    console.error("Excel import error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      count: 0,
    };
  }
}

export const handleExport = async (
  services: Service[],
  branchInfo: Branches
) => {
  try {
    if (services) {
      const headerRows = [
        ["KATEGORI", "Laundry Satuan"],
        ["Outlet", branchInfo.name],
        ["", "Offline and Online"],
        ["Branch Id", branchInfo._id],
        [""],
        [""],
      ];

      // 2. Convert service data to array of arrays
      const serviceTableData = [
        ["Type", "Category", "Service Name", "Price"], // header row
        ...services.map((s) => [
          s.type,
          s.category,
          s.servicename,
          s.price.toLocaleString("id-ID"), // Format price as "25,000"
        ]),
      ];

      // 3. Combine header + table
      const sheetData = [...headerRows, ...serviceTableData];

      // 4. Create worksheet and workbook
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Services");

      // 5. Save to file
      const buffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx",
      });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      return {
        success: true,
        message: "Excel file download successful",
        data: blob,
      };
    } else {
      return {
        success: false,
        message: "Services not found",
      };
    }
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
};
