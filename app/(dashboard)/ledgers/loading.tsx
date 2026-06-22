import { TableSkeleton } from "@/components/dashboard/page-skeleton";

export default function LedgersLoading() {
  return (
    <div className="space-y-5 md:space-y-6">
      <TableSkeleton rows={10} cols={5} />
    </div>
  );
}
