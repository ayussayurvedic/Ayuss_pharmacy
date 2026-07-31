'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log metric name, value, id, and rating to console
    // In production, these can be logged to a custom endpoint or database
    console.log(`[Web Vitals] ${metric.name}:`, {
      id: metric.id,
      value: metric.value,
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      navigationType: metric.navigationType,
    });
  });

  return null;
}
