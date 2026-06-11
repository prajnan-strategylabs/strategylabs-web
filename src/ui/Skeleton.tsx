/** Shimmer placeholder — always matches the exact dimensions of the final
 *  content (DESIGN.md §4). Never render fake values while loading. */
export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function SkeletonRow() {
  return (
    <div className="rounded-md2 border border-line bg-surface-1 p-4 flex items-center gap-3">
      <Skeleton className="h-11 w-11 rounded-sm2" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-44" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}
