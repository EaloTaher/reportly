import { Skeleton } from "@/components/ui/skeleton"

export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/8"
        >
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-4 w-28" />
          <Skeleton className="mt-2 h-4 w-52" />
        </div>
      ))}
    </div>
  )
}
