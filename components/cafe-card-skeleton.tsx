import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const cardSkeletonVariants = cva("w-full flex flex-col relative", {
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
// They do not need to change between 'small' and 'large' variants.
const titleSkeletonClass = "h-5 w-3/4";
const iconSkeletonClass = "h-6 w-6 rounded-full";

// The only difference between sizes is the min-width on the image
// to work around the Suspense rendering issue.
const imageSkeletonVariants = cva("w-full aspect-square rounded-md", {
  variants: {
    size: {
      small: "",
      large: "min-w-[320px]",
    },
  },
  defaultVariants: {
    size: "small",
  },
});

export interface CafeCardSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardSkeletonVariants> {}

export function CafeCardSkeleton({
  className,
  size,
  ...props
}: CafeCardSkeletonProps) {
  return (
    <Card
      role="figure"
      className={cn(cardSkeletonVariants({ size, className }))}
      {...props}
    >
      <div className="flex justify-between items-center p-4 pl-6 pr-[1.1rem]">
        <Skeleton className={titleSkeletonClass} />
        <div className="flex items-center gap-2">
          <Skeleton className={iconSkeletonClass} />
          <Skeleton className={iconSkeletonClass} />
        </div>
      </div>
      <div className="flex-grow"></div> {/* Flexible spacer added */}
      <CardContent className="px-4 pb-4">
        <Skeleton className={cn(imageSkeletonVariants({ size }))} />
      </CardContent>
    </Card>
  );
}
