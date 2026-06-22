import { KpiCardsSkeleton, TableSkeleton } from "@/components/dashboard/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProcurementLoading() {
  return (
    <div className="space-y-5 md:space-y-6">
      <KpiCardsSkeleton count={4} />
      <Card className="border-border bg-card">
        <CardContent className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
