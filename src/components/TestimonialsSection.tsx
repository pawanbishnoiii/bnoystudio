import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Rahul Sharma', role: 'Startup Founder', text: 'DevMarket saved us months of development time. The SaaS dashboard we purchased was production-ready and beautifully coded.', avatar: '👨‍💻' },
  { name: 'Priya Patel', role: 'Freelance Developer', text: 'The quality of projects here is unmatched. Clean code, modern stack, and easy to customize. Highly recommended!', avatar: '👩‍💼' },
  { name: 'Amit Kumar', role: 'Agency Owner', text: 'We use DevMarket projects as starting points for client work. The time saved is incredible. Worth every rupee.', avatar: '🧑‍💻' },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">What Our <span className="gradient-text">Buyers</span> Say</h2>
          <p className="text-muted-foreground">Trusted by developers and businesses across India</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <p className="font-display font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
