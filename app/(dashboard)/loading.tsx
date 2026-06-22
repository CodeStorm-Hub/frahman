import { KpiCardsSkeleton, ChartSkeleton, TableSkeleton } from "@/components/dashboard/page-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-5 md:space-y-6">
      <KpiCardsSkeleton count={4} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton rows={6} cols={3} />
    </div>
  );
}
