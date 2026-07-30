import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 max-w-[1280px] mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-slate-200" />
          <Skeleton className="h-4 w-64 bg-slate-200" />
        </div>
        <Skeleton className="h-10 w-36 bg-slate-200 rounded-full" />
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 bg-slate-200" />
              <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
            </div>
            <Skeleton className="h-8 w-16 bg-slate-200" />
            <Skeleton className="h-3 w-32 bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-2">
          <Skeleton className="h-6 w-32 bg-slate-200" />
          <Skeleton className="h-8 w-48 bg-slate-200 rounded-lg" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full bg-slate-100 rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-slate-50/50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
