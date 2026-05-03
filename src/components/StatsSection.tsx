import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { Code2, Users, Layers, Star } from 'lucide-react';

const stats = [
  { icon: Code2, value: 50, suffix: '+', label: 'Total Projects' },
  { icon: Users, value: 200, suffix: '+', label: 'Happy Buyers' },
  { icon: Layers, value: 15, suffix: '+', label: 'Technologies' },
  { icon: Star, value: 4.9, decimals: 1, suffix: '/5', label: 'Support Rating' },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-display font-bold gradient-text">
                {inView && (
                  <CountUp end={stat.value} duration={2.5} decimals={stat.decimals || 0} suffix={stat.suffix} />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
