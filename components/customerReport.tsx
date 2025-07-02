"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBranch } from "@/contexts/branch-context";
import { AppDispatch, RootState } from "@/store";
import { fetchCustomerReport } from "@/store/CusotomerReportSlice";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { CalendarDays, Download, FileSpreadsheet } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CustomerReport() {
  const { currentBranchId } = useBranch();
  const dispatch = useDispatch<AppDispatch>();
  const { items: data } = useSelector(
    (state: RootState) => state.customerReportReducer
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    dispatch(
      fetchCustomerReport({
        branchId: currentBranchId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
    );
  }, [dispatch, currentBranchId, startDate, endDate]);

  const exportToExcel = async () => {
    try {
      const dataToExport = data?.length! > 0 ? data : [];

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Laundry");

      // Define columns with Indonesian headers
      worksheet.columns = [
        { header: "CIF", key: "cif", width: 12 },
        { header: "Nama", key: "nama", width: 20 },
        { header: "Tanggal Cuci Awal", key: "tanggalCuciAwal", width: 18 },
        { header: "Jumlah Deposit", key: "jumlahDeposit", width: 16 },
        { header: "Saldo Deposit", key: "saldoDeposit", width: 16 },
        { header: "Jumlah Transaksi", key: "jumlahTransaksi", width: 18 },
        { header: "Nilai Transaksi", key: "nilaiTransaksi", width: 16 },
        {
          header: "Jumlah Transaksi Kiloan",
          key: "jumlahTransaksiKiloan",
          width: 22,
        },
        {
          header: "Jumlah Transaksi Satuan",
          key: "jumlahTransaksiSatuan",
          width: 22,
        },
      ];

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "366092" },
      };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 25;

      // Add data rows
      dataToExport?.forEach((item) => {
        worksheet.addRow({
          cif: item.cif,
          nama: item.nama,
          tanggalCuciAwal: item.tanggalCuciAwal,
          jumlahDeposit: item.jumlahDeposit,
          saldoDeposit: item.saldoDeposit,
          jumlahTransaksi: item.jumlahTransaksi,
          nilaiTransaksi: item.nilaiTransaksi,
          jumlahTransaksiKiloan: item.jumlahTransaksiKiloan,
          jumlahTransaksiSatuan: item.jumlahTransaksiSatuan,
        });
      });

      // Format currency columns
      const currencyColumns = [4, 5, 7]; // Jumlah Deposit, Saldo Deposit, Nilai Transaksi
      currencyColumns.forEach((colIndex) => {
        const column = worksheet.getColumn(colIndex);
        column.numFmt = '"Rp "#,##0';
      });

      // Format date column
      const dateColumn = worksheet.getColumn(3); // Tanggal Cuci Awal
      dateColumn.numFmt = "dd/mm/yyyy";

      // Add borders to all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();

      // Create blob and save file
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const dateRange =
        startDate && endDate ? `_${startDate}_to_${endDate}` : "";
      const fileName = `data-laundry${dateRange}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Terjadi kesalahan saat mengekspor data");
    }
  };

  const exportToCSV = () => {
    try {
      const dataToExport = data!.length > 0 ? data : [];

      // Create CSV headers
      const headers = [
        "CIF",
        "Nama",
        "Tanggal Cuci Awal",
        "Jumlah Deposit",
        "Saldo Deposit",
        "Jumlah Transaksi",
        "Nilai Transaksi",
        "Jumlah Transaksi Kiloan",
        "Jumlah Transaksi Satuan",
      ];

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...dataToExport!.map((row) =>
          [
            row.cif,
            `"${row.nama}"`,
            row.tanggalCuciAwal,
            row.jumlahDeposit,
            row.saldoDeposit,
            row.jumlahTransaksi,
            row.nilaiTransaksi,
            row.jumlahTransaksiKiloan,
            row.jumlahTransaksiSatuan,
          ].join(",")
        ),
      ].join("\n");

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const dateRange =
        startDate && endDate ? `_${startDate}_to_${endDate}` : "";
      const fileName = `data-laundry${dateRange}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Terjadi kesalahan saat mengekspor data");
    }
  };

  console.log(data);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Data Laundry Export
          </CardTitle>
          <CardDescription>
            Export data pelanggan laundry ke format Excel atau CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5" />
              <h3 className="font-semibold">Filter Berdasarkan Tanggal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="start-date">Tanggal Mulai</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-date">Tanggal Akhir</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Button onClick={exportToExcel} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
