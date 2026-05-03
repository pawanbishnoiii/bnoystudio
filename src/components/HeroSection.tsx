import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

const heroCards = [
  { title: 'NovaShop', tag: 'E-Commerce', price: '₹1,499', from: 'from-fire', to: 'to-sun' },
  { title: 'PulseDash', tag: 'SaaS Admin', price: '₹1,999', from: 'from-fire-deep', to: 'to-fire' },
  { title: 'Aurora Folio', tag: 'Portfolio', price: 'FREE', from: 'from-sun', to: 'to-fire-light' },
];

export default function HeroSection() {
  const { isAdmin, setShowAuthModal } = useAuthStore();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden hero-mesh pt-28 pb-16">
      {/* Decorative blobs */}
      <svg className="absolute -top-32 -left-32 w-[480px] h-[480px] opacity-60 pointer-events-none" viewBox="0 0 200 200" aria-hidden>
        <defs><radialGradient id="g1"><stop offset="0%" stopColor="#FF5722" stopOpacity="0.45" /><stop offset="100%" stopColor="#FFC107" stopOpacity="0" /></radialGradient></defs>
        <circle cx="100" cy="100" r="100" fill="url(#g1)" />
      </svg>
      <svg className="absolute -bottom-32 -right-20 w-[520px] h-[520px] opacity-60 pointer-events-none" viewBox="0 0 200 200" aria-hidden>
        <defs><radialGradient id="g2"><stop offset="0%" stopColor="#FFC107" stopOpacity="0.5" /><stop offset="100%" stopColor="#FF5722" stopOpacity="0" /></radialGradient></defs>
        <circle cx="100" cy="100" r="100" fill="url(#g2)" />
      </svg>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border shadow-card text-sm">
              <Sparkles className="h-4 w-4 text-fire" />
              <span className="font-medium text-ink">🚀 Premium Web Projects</span>
            </motion.div>

            <motion.h1 variants={item} className="mt-5 text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.05] text-ink">
              Buy ready-made websites. <br />
              <span className="gradient-text">Deploy in minutes.</span>
            </motion.h1>

            <motion.p variants={item} className="mt-5 text-lg text-muted-foreground max-w-xl">
              Production-ready React, Next.js and Vercel projects built by senior engineers. Preview live → buy securely → download the source code.
            </motion.p>

            <motion.div variants={item} className="mt-7 flex flex-wrap gap-3">
              <Link to="/marketplace">
                <Button size="lg" className="gradient-fire-strong text-white hover:opacity-95 glow-fire">
                  Browse Projects
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {isAdmin ? (
                <Link to="/admin"><Button size="lg" variant="outline" className="border-border">Admin Panel</Button></Link>
              ) : (
                <Button size="lg" variant="outline" className="border-border" onClick={() => setShowAuthModal(true, 'Sign in to start buying.')}>
                  Get Started
                </Button>
              )}
            </motion.div>

            <motion.div variants={item} className="mt-7 flex flex-wrap gap-3">
              <Pill icon={<Sparkles className="h-3.5 w-3.5 text-fire" />}>50+ Projects</Pill>
              <Pill icon={<Star className="h-3.5 w-3.5 text-sun" />}>4.9 Rating</Pill>
              <Pill icon={<ShieldCheck className="h-3.5 w-3.5 text-fire" />}>Secure Checkout</Pill>
            </motion.div>
          </motion.div>

          {/* Floating cards */}
          <div className="relative h-[440px] hidden lg:block">
            {heroCards.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 40, rotate: i === 0 ? -6 : i === 1 ? 0 : 6 }}
                animate={{ opacity: 1, y: 0, rotate: i === 0 ? -6 : i === 1 ? 0 : 6 }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.6 }}
                className={`absolute w-64 bg-white rounded-2xl shadow-card-hover border border-border overflow-hidden ${
                  i === 0 ? 'top-2 left-0 animate-float' : i === 1 ? 'top-24 left-1/2 -translate-x-1/2 animate-float-delayed z-10' : 'bottom-2 right-0 animate-float'
                }`}
              >
                <div className={`h-32 bg-gradient-to-br ${c.from} ${c.to}`} />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-ink">{c.title}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.price === 'FREE' ? 'bg-green-100 text-green-700' : 'bg-fire/10 text-fire'}`}>{c.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.tag}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border shadow-card text-sm font-medium text-ink">
      {icon}{children}
    </div>
  );
}
