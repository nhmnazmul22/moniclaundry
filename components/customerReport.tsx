"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBranch } from "@/contexts/branch-context";
import { AppDispatch, RootState } from "@/store";
import { fetchCustomerReport } from "@/store/CusotomerReportSlice";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download, FileSpreadsheet } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

type CustomerReport = {
  startDate: string;
  endDate: string;
};

export default function CustomerReport({ startDate, endDate }: CustomerReport) {
  const { currentBranchId } = useBranch();
  const dispatch = useDispatch<AppDispatch>();
  const { items: data } = useSelector(
    (state: RootState) => state.customerReportReducer
  );

  useEffect(() => {
    if (startDate && endDate) {
      dispatch(
        fetchCustomerReport({
          branchId: currentBranchId,
          startDate: startDate,
          endDate: endDate,
        })
      );
    }
  }, [startDate, endDate]);

  const exportToExcel = async () => {
    try {
      const dataToExport = data?.length! > 0 ? data : [];

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Laundry");

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

      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      for (let col = 1; col <= 9; col++) {
        const cell = headerRow.getCell(col);
        cell.font = { bold: true, color: { argb: "000000" } };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

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

      const currencyColumns = [4, 5, 7];
      currencyColumns.forEach((colIndex) => {
        const column = worksheet.getColumn(colIndex);
        column.numFmt = '"Rp "#,##0';
      });

      const dateColumn = worksheet.getColumn(3);
      dateColumn.numFmt = "dd/mm/yyyy";

      worksheet.eachRow((row) => {
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

      const dateRange =
        startDate && endDate ? `_${startDate}_to_${endDate}` : "";
      const fileName = `data-laundry${dateRange}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Terjadi kesalahan saat mengekspor data");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-6 w-6" />
          Laporan Customer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={exportToExcel}
          className="flex items-center gap-2 w-full"
        >
          <Download className="h-4 w-4" />
          Export Laporan
        </Button>
      </CardContent>
    </Card>
  );
}
