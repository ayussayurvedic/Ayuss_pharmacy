'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionHeading({
  label,
  title,
  description,
  centered = true,
  light = false,
}: SectionHeadingProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className={cn('mb-12 md:mb-16', centered && 'text-center')}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {label && (
        <span
          className={cn(
            'inline-block font-semibold text-sm uppercase tracking-widest mb-3',
            light ? 'text-primary-300' : 'text-primary-500'
          )}
        >
          {label}
        </span>
      )}
      <h2
        className={cn(
          'text-3xl md:text-4xl lg:text-5xl font-bold mb-4',
          light ? 'text-white' : 'text-navy-900'
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'text-lg max-w-2xl leading-relaxed',
            centered && 'mx-auto',
            light ? 'text-gray-300' : 'text-text-secondary'
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
