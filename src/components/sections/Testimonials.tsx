'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

const testimonials = [
  {
    quote:
      'S.S. Pharmacy products have become a staple in our household. The quality and purity of their Ayurvedic formulations are unmatched.',
    name: 'Dr. Ramesh Verma',
    role: 'Ayurvedic Practitioner',
    company: 'Wellness Clinic',
  },
  {
    quote:
      'As a distributor, I appreciate their consistent product quality and reliable supply chain. S.S. Pharmacy is a trusted partner.',
    name: 'Sunil Agarwal',
    role: 'Wholesale Distributor',
    company: 'Agarwal Medical Stores',
  },
  {
    quote:
      'The herbal remedies from S.S. Pharmacy have helped our patients achieve genuine relief. Traditional wisdom meets modern quality.',
    name: 'Dr. Meena Iyer',
    role: 'Senior Physician',
    company: 'Ayurveda Health Centre',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="section-padding bg-navy-900 relative overflow-hidden">
      {/* Decorative orb */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container-wide relative">
        <SectionHeading
          label="Testimonials"
          title="What Our Clients Say"
          description="Hear from practitioners and partners who trust S.S. Pharmacy for authentic Ayurvedic remedies."
          light
        />

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="text-center"
            >
              <Quote className="w-10 h-10 text-primary-400/40 mx-auto mb-6" />
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8 font-light italic">
                &ldquo;{testimonials[current].quote}&rdquo;
              </p>
              <div>
                <p className="text-white font-semibold text-lg">
                  {testimonials[current].name}
                </p>
                <p className="text-primary-400 text-sm">
                  {testimonials[current].role}, {testimonials[current].company}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === current ? 'bg-primary-400 w-8' : 'bg-white/20 w-2 hover:bg-white/40'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
