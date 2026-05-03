import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Arjun Sharma', role: 'Startup Founder', company: 'TechLaunch',
    text: "Bought the SaaS dashboard template — saved me 3 weeks of dev time. The code quality is production-grade and well structured." },
  { name: 'Priya Mehta', role: 'Freelance Developer', company: 'Self',
    text: "The e-commerce starter is incredible. Stripe integration already set up, responsive on all devices. Worth every rupee." },
  { name: 'Rahul Verma', role: 'CTO', company: 'BuildFast',
    text: "Our team used 3 templates from DevMarket this quarter. Clean TypeScript code, excellent Tailwind structure." },
  { name: 'Sneha Patel', role: 'UI/UX Designer', company: 'PixelCraft',
    text: "As a designer who codes, these templates are exactly what I need — beautiful UI + working backend in minutes." },
  { name: 'Karan Joshi', role: 'Solo Developer', company: 'IndieHacker',
    text: "The portfolio template helped me land 2 clients. Simple, animated, and exactly what modern clients want to see." },
  { name: 'Divya Nair', role: 'Product Manager', company: 'ScaleUp',
    text: "DevMarket has the cleanest marketplace UI I've seen. Preview before buying is a great feature — no surprises." },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <section ref={ref} className="py-24 warm-bg">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-14">
          <p className="text-fire uppercase text-xs font-bold tracking-[0.2em] mb-2">Testimonials</p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-ink">Loved by <span className="gradient-text">Builders</span></h2>
          <p className="text-muted-foreground mt-3">Join 200+ developers who've already shipped faster with DevMarket.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-md border border-border card-hover">
              <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-fire text-fire" />)}</div>
              <p className="text-sm text-gray-700 italic leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=FF5722&color=fff&size=40`}
                  alt={t.name} className="w-10 h-10 rounded-full" loading="lazy" />
                <div>
                  <p className="font-semibold text-sm text-ink">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
