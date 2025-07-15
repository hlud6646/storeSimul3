"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
);

interface OrderData {
  date: string;
  orders: number;
}

function transformData(data: OrderData[]) {
  const labels = data.map((item) => {
    const date = new Date(item.date);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  });
  const values = data.map((item) => item.orders);

  return {
    labels,
    datasets: [
      {
        data: values,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };
}

export function OrdersLineChart() {
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8005'}/orders_over_time`);
        const data: OrderData[] = await response.json();
        setChartData(transformData(data));
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    }

    fetchChartData();
    const interval = setInterval(fetchChartData, 2000);

    return () => clearInterval(interval);
  }, []);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
        display: false,
      },
      title: {
        display: true,
        text: "Orders Over Time",
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          maxTicksLimit: 10,
        },
      },
    },
  };

  return <Line options={chartOptions} data={chartData} />;
}
