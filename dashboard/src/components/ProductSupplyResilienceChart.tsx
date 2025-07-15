import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart } from "./charts";
import type { ChartData, ChartOptions } from "chart.js";

interface ProductSupplyResilience {
  name: string;
  inventory: number;
  suppliers: number;
}

export function ProductSupplyResilienceChart() {
  const [chartData, setChartData] = useState<ChartData<"bar">>({
    labels: [],
    datasets: [],
  });
  const [inventoryData, setInventoryData] = useState<number[]>([]);

  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8005'}/product_supply_resilience`);
        const data: ProductSupplyResilience[] = await response.json();
        const labels = data.map((p) => p.name);
        const values = data.map((p) => p.suppliers);
        setInventoryData(data.map((p) => p.inventory));

        setChartData({
          labels,
          datasets: [
            {
              label: "Number of Suppliers",
              data: values,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch product supply resilience:", error);
      }
    }

    fetchChartData();
    const interval = setInterval(fetchChartData, 5000);

    return () => clearInterval(interval);
  }, []);

  const chartOptions: ChartOptions<"bar"> = {
    scales: {
      y: {
        ticks: {
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterLabel: function (context) {
            const inventory = inventoryData[context.dataIndex];
            return `Inventory: ${inventory}`;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Products by Supply Resilience</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart data={chartData} options={chartOptions} />
      </CardContent>
    </Card>
  );
}
