'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        id: metric.id,
        value: metric.value,
        rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
        navigationType: metric.navigationType,
      });
    }
  });

  return null;
}
