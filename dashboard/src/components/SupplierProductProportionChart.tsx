import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart } from "./charts";
import type { ChartData, ChartOptions } from "chart.js";

interface SupplierProportion {
  name: string;
  proportion: number;
}

export function SupplierProductProportionChart() {
  const [chartData, setChartData] = useState<ChartData<"bar">>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8005'}/supplier_product_proportion`);
        const data: SupplierProportion[] = await response.json();
        const labels = data.map((p) => p.name);
        const values = data.map((p) => p.proportion);

        setChartData({
          labels,
          datasets: [
            {
              label: "Proportion of Products",
              data: values,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch supplier product proportion:", error);
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
          callback: function (value) {
            return (Number(value) * 100).toFixed(0) + "%";
          },
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
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += (context.parsed.y * 100).toFixed(2) + "%";
            }
            return label;
          },
        },
      },
      title: {
        display: true,
        text: "Supplier Contribution to Product Catalog",
      },
    },
  };

  return (
    <Card>
      {/* <CardHeader>
        <CardTitle>Supplier Contribution to Product Catalog</CardTitle>
      </CardHeader> */}
      <CardContent>
        <BarChart data={chartData} options={chartOptions} />
      </CardContent>
    </Card>
  );
}
