import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart } from "./charts";
import type { ChartData, ChartOptions } from "chart.js";

interface Customer {
  name: string;
  orders: number;
}

export function TopCustomersChart() {
  const [chartData, setChartData] = useState<ChartData<"bar">>({
    labels: [],
    datasets: [],
  });

  const chartOptions: ChartOptions<"bar"> = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Top 5 Customers",
      },
    },
  };

  useEffect(() => {
    async function fetchTopCustomers() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8005'}/top_customers`);
        const data: Customer[] = await response.json();
        const labels = data.map((c) => c.name);
        const values = data.map((c) => c.orders);

        setChartData({
          labels,
          datasets: [
            {
              label: "Total Orders",
              data: values,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch top customers:", error);
      }
    }

    fetchTopCustomers();
    const interval = setInterval(fetchTopCustomers, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      {/* <CardHeader>
        <CardTitle>Top 5 Customers</CardTitle>
      </CardHeader> */}
      <CardContent>
        <BarChart data={chartData} options={chartOptions} />
      </CardContent>
    </Card>
  );
}
