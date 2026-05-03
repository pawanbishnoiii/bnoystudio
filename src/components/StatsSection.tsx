import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { Package, Users, Star, ShieldCheck } from 'lucide-react';

const stats = [
  { icon: Package, end: 50, suffix: '+', label: 'Projects Available' },
  { icon: Users, end: 200, suffix: '+', label: 'Happy Buyers' },
  { icon: Star, end: 4.9, decimals: 1, suffix: '★', label: 'Average Rating' },
  { icon: ShieldCheck, end: 100, suffix: '%', label: 'Secure Payments' },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <section ref={ref} className="warm-bg py-16">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-white rounded-2xl p-6 border border-border shadow-card text-center"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl gradient-fire text-white mb-3">
              <s.icon className="h-5 w-5" />
            </div>
            <p className="font-display text-3xl font-extrabold text-ink">
              {inView && <CountUp end={s.end} duration={1.6} decimals={s.decimals || 0} />}{s.suffix}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
