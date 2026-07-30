import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
      {/* Breadcrumb Skeleton */}
      <Skeleton className="h-4 w-48 bg-slate-200" />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column: Product Image */}
        <div className="space-y-4">
          <Skeleton className="h-96 md:h-[500px] w-full bg-slate-100 rounded-2xl" />
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Right Column: Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-slate-200" />
            <Skeleton className="h-10 w-3/4 bg-slate-200" />
            <Skeleton className="h-4 w-36 bg-slate-200" />
          </div>

          <div className="py-4 border-y border-slate-200/60 space-y-2">
            <Skeleton className="h-8 w-24 bg-slate-200" />
            <Skeleton className="h-4 w-48 bg-slate-200" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-slate-200" />
            <Skeleton className="h-4 w-full bg-slate-200" />
            <Skeleton className="h-4 w-2/3 bg-slate-200" />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-12 w-32 bg-slate-200 rounded-full" />
            <Skeleton className="h-12 w-full bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
