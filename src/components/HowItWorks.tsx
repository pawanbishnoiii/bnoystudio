import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, CreditCard, Rocket } from 'lucide-react';

const steps = [
  { icon: Search, title: 'Browse', desc: 'Explore our curated collection of premium web projects built with modern technologies.' },
  { icon: CreditCard, title: 'Buy', desc: 'Purchase securely with Razorpay. Free projects available for instant download.' },
  { icon: Rocket, title: 'Deploy', desc: 'Download source code and deploy to Vercel in minutes. Start scaling instantly.' },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24" id="about">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Get your project running in three simple steps</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="text-center relative"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6">
                <step.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="absolute top-8 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center font-display font-bold text-sm text-primary -mt-12 -ml-12">
                {i + 1}
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
