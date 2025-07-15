"use client";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export const options: ChartOptions<"bar"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Chart.js Bar Chart",
    },
  },
};

export function BarChart({
  data,
  options,
  title,
}: {
  data: ChartData<"bar">;
  options?: ChartOptions<"bar">;
  title?: string;
}) {
  const chartOptions = {
    ...options,
  };
  return <Bar options={options} data={data} />;
}

export function PieChart({
  data,
  options,
}: {
  data: ChartData<"pie">;
  options?: ChartOptions<"pie">;
}) {
  return <Pie data={data} options={options} />;
}
