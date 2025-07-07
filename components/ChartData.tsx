import api from "@/lib/config/axios";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartConfig, ChartContainer } from "./ui/chart";

type ChartDataType = {
  branchId: string;
};

type ApiChartDataItem = {
  month: string;
  kilogramTotal: number;
  satuanTotal: number;
  meterTotal: number;
};

const ChartData: React.FC<ChartDataType> = ({ branchId }) => {
  const [chartData, setChartData] = useState<ApiChartDataItem[]>([]);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = `${currentYear}-12-31`;

  const chartConfig = {
    kilogramTotal: {
      label: "Total Kiloan (Kg)",
      color: "#2563eb",
    },
    satuanTotal: {
      label: "Total Satuan (Qty)",
      color: "#10b981",
    },
    meterTotal: {
      label: "Total Meter (Qty)",
      color: "#f59e0b",
    },
  } satisfies ChartConfig;

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/reports/service-report?branch_id=${branchId}&start_date=${startDate}&end_date=${endDate}`
      );
      if (res.status === 200) {
        setChartData(res.data.chartData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (branchId) {
      fetchChartData();
    }
  }, [branchId]);

  if (loading) return <div>Loading chart...</div>;
  if (!chartData.length) return <div>No data for the current year</div>;

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="kilogramTotal"
            fill={chartConfig.kilogramTotal.color}
            name={chartConfig.kilogramTotal.label}
            radius={4}
          />
          <Bar
            dataKey="satuanTotal"
            fill={chartConfig.satuanTotal.color}
            name={chartConfig.satuanTotal.label}
            radius={4}
          />
          <Bar
            dataKey="meterTotal"
            fill={chartConfig.meterTotal.color}
            name={chartConfig.meterTotal.label}
            radius={4}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ChartData;
