"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
type DataPoint = { month: string; revenue: number };

type TooltipArgs = {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
};

function CustomTooltip({ active, payload, label }: TooltipArgs) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value ?? 0;
  const taka = "৳" + (val / 100).toLocaleString("en-BD", { maximumFractionDigits: 0 });
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold text-foreground">{taka}</p>
    </div>
  );
}

export function RevenueChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
        No revenue data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#60a5fa"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#60a5fa" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
