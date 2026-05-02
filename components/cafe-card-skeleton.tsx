import { cn } from "@/lib/utils";

export type CafeCardSkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function CafeCardSkeleton({
  className,
  ...props
}: CafeCardSkeletonProps) {
  return (
    <div className={cn("relative h-full flex flex-col p-3 w-full animate-pulse", className)} {...props}>
      {/* The 'Photo' Container Skeleton */}
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-secondary/40 handwritten-border !border-primary/10 shadow-sm">
        <div className="absolute inset-0 bg-skeleton-brown/20" />
      </div>

      {/* The 'Caption' Skeleton */}
      <div className="mt-4 px-1 flex flex-col gap-2">
        <div className="h-6 w-[70%] bg-secondary/60 rounded-sm" />
        <div className="h-4 w-[40%] bg-secondary/40 rounded-sm italic" />
      </div>
    </div>
  );
}
