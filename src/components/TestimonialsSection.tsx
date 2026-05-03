import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  { name: 'Arjun Sharma', role: 'Startup Founder', company: 'TechLaunch IN',
    quote: 'Bought the SaaS dashboard — saved 3 weeks dev time. Production-grade TypeScript code, clean architecture.' },
  { name: 'Priya Mehta', role: 'Freelance Dev', company: 'Self-employed',
    quote: 'E-commerce starter is incredible. Razorpay already integrated, responsive on all devices. Worth every rupee.' },
  { name: 'Rahul Verma', role: 'CTO', company: 'BuildFast',
    quote: 'Team used 3 templates this quarter. Clean code, excellent Tailwind structure, deploy in minutes.' },
  { name: 'Sneha Patel', role: 'UI/UX Designer', company: 'PixelCraft',
    quote: 'Beautiful UI + working backend in minutes. As a designer who codes, these are exactly what I need.' },
  { name: 'Karan Joshi', role: 'Indie Developer', company: 'IndieHacker',
    quote: 'Portfolio template landed me 2 new clients. Simple, animated, modern — exactly what clients want.' },
  { name: 'Divya Nair', role: 'Product Manager', company: 'ScaleUp',
    quote: "DevMarket has the cleanest marketplace UI I've seen. Preview before buying is a game-changer." },
];

export default function TestimonialsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 inline-block relative">
            What Builders Say
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-1 w-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
          </h2>
          <p className="text-gray-500 mt-5">Trusted by 200+ developers across India</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <Quote className="h-8 w-8 text-orange-500/70 mb-3" />
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-orange-500 text-orange-500" />)}
              </div>
              <p className="text-gray-600 italic text-sm leading-relaxed mb-4 flex-1">"{t.quote}"</p>
              <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=FF5722&color=fff&size=48&bold=true`}
                  alt={t.name}
                  className="w-11 h-11 rounded-full ring-2 ring-orange-400 ring-offset-2"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{t.role}</span>
                    <span className="text-xs text-gray-400 truncate">{t.company}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
