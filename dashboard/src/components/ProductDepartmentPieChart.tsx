import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { PieChart } from "./charts";
import type { ChartData, ChartOptions } from "chart.js";

interface DepartmentProductCount {
  department: string;
  count: number;
}

export function ProductDepartmentPieChart() {
  const [chartData, setChartData] = useState<ChartData<"pie">>({
    datasets: [],
  });

  const chartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Products by Department",
      },
    },
  };

  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8005'}/products_by_department`);
        const data: DepartmentProductCount[] = await response.json();
        const sortedData = [...data].sort((a, b) => b.count - a.count);
        const top10Data = sortedData.slice(0, 10);
        const colors = top10Data.map(
          (_, i) => `hsl(${(i * 360) / top10Data.length}, 50%, 60%)`,
        );
        setChartData({
          labels: top10Data.map((d) => d.department),
          datasets: [
            {
              data: top10Data.map((d) => d.count),
              backgroundColor: colors,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }

    fetchChartData();
  }, []);

  return (
    <Card className="w-full">
      {/* <CardHeader>
        <CardTitle>Products by Department</CardTitle>
      </CardHeader> */}
      <CardContent>
        <div className="h-[400px] w-full">
          <PieChart options={chartOptions} data={chartData} />
        </div>
      </CardContent>
    </Card>
  );
}
