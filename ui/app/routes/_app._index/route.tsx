import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Route } from "./+types/route";
import { Card, CardHeader } from "@heroui/react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const fills = [
  "fill-primary",
  "fill-secondary",
  "fill-success",
  "fill-warning",
];

const pieChartData = [
  { name: "Male", count: 132, color: "red" },
  { name: "Female", count: 164 },
  { name: "N/A", count: 32 },
  { name: "Other", count: 6 },
];

export default function Home() {
  return (
    <>
      <h1 className="text-center text-3xl font-semibold px-8 py-12">Home</h1>
    </>
  );
}
