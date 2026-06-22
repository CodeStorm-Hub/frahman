import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function KpiCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 gap-3 md:grid-cols-${count} md:gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border bg-card">
          <CardContent className="p-4">
            <Skeleton className="mb-3 h-9 w-9 rounded-lg" />
            <Skeleton className="mb-1.5 h-7 w-28" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton
                  key={j}
                  className={`h-4 ${j === 0 ? "w-32" : j === cols - 1 ? "ml-auto w-20" : "w-24"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-1">
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="pt-2">
        <Skeleton className="h-44 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
