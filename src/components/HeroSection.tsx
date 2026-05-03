import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const { isAdmin, setShowAuthModal } = useAuthStore();
  const headline = ['Buy', 'ready-made', 'websites.', 'Deploy', 'in', 'minutes.'];

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
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border shadow-card text-sm">
              <Sparkles className="h-4 w-4 text-fire" />
              <span className="font-medium text-ink">🚀 Premium Web Projects</span>
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.05] text-ink">
              {headline.slice(0, 3).map((w, i) => (
                <span key={i} className="hero-word inline-block mr-3">{w}</span>
              ))}
              <br />
              {headline.slice(3).map((w, i) => (
                <span key={i + 3} className="hero-word inline-block mr-3 gradient-text">{w}</span>
              ))}
            </h1>

            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Production-ready React, Next.js and Vercel projects built by senior engineers. Preview live → buy securely → download the source code.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/marketplace">
                <Button data-magnetic size="lg" className="gradient-fire-strong text-white hover:opacity-95 glow-fire">
                  Browse Projects
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {isAdmin ? (
                <Link to="/admin"><Button data-magnetic size="lg" variant="outline" className="border-border">Admin Panel</Button></Link>
              ) : (
                <Button data-magnetic size="lg" variant="outline" className="border-border" onClick={() => setShowAuthModal(true, 'Sign in to start buying.')}>
                  Get Started
                </Button>
              )}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Pill icon={<Sparkles className="h-3.5 w-3.5 text-fire" />}>50+ Projects</Pill>
              <Pill icon={<Star className="h-3.5 w-3.5 text-sun" />}>4.9 Rating</Pill>
              <Pill icon={<ShieldCheck className="h-3.5 w-3.5 text-fire" />}>Secure Checkout</Pill>
            </div>
          </div>

          {/* Animated code editor illustration */}
          <div className="relative h-[440px] hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="parallax-card absolute inset-0 rounded-2xl bg-[#1A1A2E] shadow-card-hover overflow-hidden glow-fire"
              data-speed="0.15"
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0F0F1E] border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs text-white/50 font-mono">App.tsx</span>
              </div>
              {/* Code lines */}
              <div className="p-6 font-mono text-sm space-y-2">
                {[
                  { c: 'text-fire', w: '70%', t: 'import { Marketplace } from "devmarket"' },
                  { c: 'text-sun', w: '50%', t: 'export default function App() {' },
                  { c: 'text-white/80', w: '85%', t: '  return <Marketplace items={projects} />' },
                  { c: 'text-fire', w: '40%', t: '}' },
                  { c: 'text-white/60', w: '65%', t: '// Ready to deploy 🚀' },
                ].map((l, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-white/30 text-xs w-4">{i + 1}</span>
                    <motion.div initial={{ width: 0 }} animate={{ width: l.w }} transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }}
                      className={`overflow-hidden whitespace-nowrap ${l.c}`}>{l.t}</motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Floating accent cards */}
            <motion.div className="parallax-card absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-card-hover border border-border w-44 rotate-[5deg]" data-speed="0.5"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <div className="text-xs text-muted-foreground">✅ Production Ready</div>
              <div className="font-display font-bold text-ink mt-1">PulseChat AI</div>
              <div className="text-fire font-bold text-sm">₹2,499</div>
            </motion.div>
            <motion.div className="absolute top-1/2 -left-8 bg-white px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold text-ink -rotate-3"
              animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              ⚡ Instant Deploy
            </motion.div>
            <motion.div className="parallax-card absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-card-hover border border-border w-44" data-speed="0.7"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <div className="flex items-center gap-2"><Star className="h-4 w-4 text-sun fill-sun" /><span className="font-bold text-sm text-ink">4.9 / 5</span></div>
              <div className="text-xs text-muted-foreground mt-1">🔒 Secure code · 200+ buyers</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border shadow-card text-sm font-medium text-ink">
      {icon}{children}
    </div>
  );
}
