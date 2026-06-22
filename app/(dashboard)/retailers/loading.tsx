import { KpiCardsSkeleton, TableSkeleton } from "@/components/dashboard/page-skeleton";

export default function RetailersLoading() {
  return (
    <div className="space-y-5 md:space-y-6">
      <KpiCardsSkeleton count={3} />
      <TableSkeleton rows={3} cols={4} />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
