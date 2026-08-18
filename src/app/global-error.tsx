'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError] Root layout error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#FDF8F0] font-sans antialiased">
        <div className="max-w-md w-full text-center bg-white border border-[#C9D5D5]/80 p-8 rounded-3xl shadow-lg space-y-6">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-[#1A5C5E]">
              System Error
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              An unexpected system error occurred. We apologize for the inconvenience.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A5C5E] text-white text-xs font-bold rounded-xl hover:bg-[#134446] transition-colors shadow-sm min-h-[44px] cursor-pointer uppercase tracking-wider"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#C9D5D5] text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors min-h-[44px] uppercase tracking-wider"
            >
              <Home className="w-4 h-4 text-[#C9943E]" />
              <span>Go Home</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
