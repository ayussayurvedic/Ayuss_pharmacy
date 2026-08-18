'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShoppingBag } from 'lucide-react';

export default function PublicRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected public route errors
    console.error('[PublicRouteError] Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FDF8F0] font-sans">
      <div className="max-w-md w-full text-center bg-white border border-[#C9D5D5]/80 p-8 rounded-2xl shadow-sm space-y-6">
        <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-2xs">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-serif font-bold text-[#1A5C5E]">
            Something unexpected occurred
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            We encountered a temporary issue while loading this page. Your cart and details remain safely preserved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A5C5E] text-white text-xs font-semibold rounded-xl hover:bg-[#134446] transition-colors shadow-2xs min-h-[44px] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#C9D5D5] text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4 text-[#C9943E]" />
            <span>Explore Products</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#1A5C5E] font-medium hover:underline"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
