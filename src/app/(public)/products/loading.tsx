import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
      {/* Title & Tagline Skeleton */}
      <div className="space-y-3 text-left">
        <Skeleton className="h-4 w-32 bg-slate-200" />
        <Skeleton className="h-10 w-64 bg-slate-200" />
        <Skeleton className="h-4 w-96 bg-slate-200" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-wrap justify-between items-center gap-4 py-4 border-y border-slate-200/60">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 bg-slate-200 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-48 bg-slate-200 rounded-lg" />
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-6 space-y-4">
            <Skeleton className="h-48 w-full bg-slate-100 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 bg-slate-200" />
              <Skeleton className="h-6 w-48 bg-slate-200" />
              <Skeleton className="h-4 w-full bg-slate-200" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-20 bg-slate-200" />
              <Skeleton className="h-10 w-28 bg-slate-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
