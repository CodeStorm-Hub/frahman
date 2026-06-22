import { KpiCardsSkeleton, TableSkeleton } from "@/components/dashboard/page-skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-5 md:space-y-6">
      <KpiCardsSkeleton count={4} />
      <TableSkeleton rows={4} cols={4} />
    </div>
  );
}
