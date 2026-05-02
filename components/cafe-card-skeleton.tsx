import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const cardSkeletonVariants = cva("w-full h-full flex flex-col relative", {
  variants: {
    size: {
      small: "",
      large: "",
    },
  },
  defaultVariants: {
    size: "small",
  },
});

// The internal skeleton sizes should match the real component's sizes.
const titleSkeletonClass = "h-5 w-[60%]";
const iconSkeletonClass = "h-9 w-9 rounded-full";

export interface CafeCardSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardSkeletonVariants> {}

export function CafeCardSkeleton({
  className,
  size,
  ...props
}: CafeCardSkeletonProps) {
  return (
    <div className="block w-full h-full">
      <Card
        role="figure"
        className={cn(
          cardSkeletonVariants({ size, className }),
          "hover:shadow-lg transition-shadow duration-200 ease-in-out"
        )}
        {...props}
      >
        <div className="flex justify-between items-start p-4 pl-6 pr-[1.1rem] min-h-[4.5rem]">
          <Skeleton className={titleSkeletonClass} />
          <div className="flex items-center gap-2 mt-1">
            <Skeleton className={iconSkeletonClass} />
            <Skeleton className={iconSkeletonClass} />
          </div>
        </div>
        <div className="flex-grow"></div>
        <CardContent className="px-4 pb-4">
          <div className="relative w-full aspect-square overflow-hidden rounded-md">
            <Skeleton className="absolute inset-0 w-full h-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
