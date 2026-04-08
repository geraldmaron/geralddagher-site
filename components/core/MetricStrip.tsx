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
    <section className="section-wrapper py-10 sm:py-12">
      <div className="section-inner-wide">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-panel-muted relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.12),transparent_36%)]" />
          <div className="relative grid grid-cols-2 gap-px overflow-hidden rounded-[inherit] bg-border/20 sm:grid-cols-4">
            {METRICS.map((m, i) => (
              <div
                key={i}
                className="flex min-h-[132px] flex-col justify-between bg-background/82 px-5 py-5 text-center sm:min-h-[148px] sm:px-7 sm:py-6 sm:text-start"
              >
                <span className="section-kicker">Snapshot</span>
                <div className="space-y-2">
                  <span className="block text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                    {m.value}
                  </span>
                  <span className="block text-xs leading-relaxed text-muted-foreground sm:max-w-[14ch]">
                    {m.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
