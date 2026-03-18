'use client';
import { motion } from 'framer-motion';

const METRICS = [
  { value: '8+',           label: 'Years product & leadership' },
  { value: '9-figure',     label: 'ARR enterprise portfolio' },
  { value: '15',           label: 'Domains of expertise' },
  { value: 'Father of 2',  label: 'Married · South Florida' },
];

export default function MetricStrip() {
  return (
    <div className="w-full border-y border-border/40 bg-muted/30">
      <div className="section-inner-wide py-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-border/40"
        >
          {METRICS.map((m, i) => (
            <div key={i} className="flex flex-col items-center sm:items-start text-center sm:text-start sm:px-8 first:ps-0 last:pe-0 gap-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums text-foreground tracking-tight leading-tight">{m.value}</span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
