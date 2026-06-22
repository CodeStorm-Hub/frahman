import { KpiCardsSkeleton, TableSkeleton } from "@/components/dashboard/page-skeleton";

export default function AccountingLoading() {
  return (
    <div className="space-y-5 md:space-y-6">
      <KpiCardsSkeleton count={4} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TableSkeleton rows={5} cols={2} />
        <TableSkeleton rows={5} cols={2} />
      </div>
    </div>
  );
}
