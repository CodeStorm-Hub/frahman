"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
type DataPoint = { name: string; bags: number };

const COLORS = ["#60a5fa", "#34d399", "#a78bfa", "#fb923c"];

type TooltipArgs = {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
};

function CustomTooltip({ active, payload, label }: TooltipArgs) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold text-foreground">{(payload[0].value ?? 0).toLocaleString()} bags</p>
    </div>
  );
}

export function StockChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
        No inventory data
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="bags" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
