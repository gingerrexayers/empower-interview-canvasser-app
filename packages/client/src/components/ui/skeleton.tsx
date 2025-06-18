import * as h from "preact";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: h.JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
