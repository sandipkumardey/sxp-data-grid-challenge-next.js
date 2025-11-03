import { Skeleton } from '@/components/ui/skeleton';

export function DataGridSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="grid grid-cols-12 gap-4 border-b pb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="col-span-2">
            <Skeleton className="h-5 w-3/4" />
          </div>
        ))}
      </div>
      
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-12 gap-4 py-3 border-b hover:bg-muted/50 transition-colors">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={`row-${rowIndex}-col-${colIndex}`} className="col-span-2">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ))}
      
      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <Skeleton className="h-8 w-24" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
