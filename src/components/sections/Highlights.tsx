'use client';

import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Award, FlaskConical } from 'lucide-react';

export default function Highlights() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 py-12 -mt-10 relative z-30 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Natural Ingredients</h4>
            <p className="text-[10px] text-slate-400">Carefully selected herbs</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Ayurvedic Expertise</h4>
            <p className="text-[10px] text-slate-400">Research & tradition</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">GMP Certified</h4>
            <p className="text-[10px] text-slate-400">GMP compliant facility</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">No Harmful Chemicals</h4>
            <p className="text-[10px] text-slate-400">Zero steroids or toxins</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
