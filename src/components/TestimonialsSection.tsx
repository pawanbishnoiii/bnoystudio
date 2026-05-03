import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Rahul Sharma', role: 'Startup Founder', text: 'DevMarket saved us months. The SaaS dashboard we bought was production-ready and beautifully coded.', avatar: '👨‍💻' },
  { name: 'Priya Patel', role: 'Freelance Developer', text: 'Quality is unmatched. Clean code, modern stack, and easy to customize. Highly recommended!', avatar: '👩‍💼' },
  { name: 'Amit Kumar', role: 'Agency Owner', text: 'We use these as starting points for client work. The time saved is incredible. Worth every rupee.', avatar: '🧑‍💻' },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <section ref={ref} className="py-24 warm-bg">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-ink">Loved by <span className="gradient-text">builders</span></h2>
          <p className="text-muted-foreground mt-3">Trusted by indie hackers and agencies across India.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.12 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-card card-hover">
              <div className="flex gap-1 mb-3">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-sun text-sun" />)}</div>
              <p className="text-sm text-ink/80 mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <p className="font-display font-bold text-sm text-ink">{t.name}</p>
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
