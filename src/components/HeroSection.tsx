import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowRight, Star, ShieldCheck, Sparkles, Zap, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CpuArchitecture from '@/components/ui/cpu-architecture';
import bnoyHero from '@/assets/bnoy-hero-banner.jpg';
import bnoyLogo from '@/assets/bnoy-logo.png';

export default function HeroSection() {
  const { isAdmin, setShowAuthModal } = useAuthStore();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => (await supabase.from('site_settings').select('*').limit(1).maybeSingle()).data,
  });
  const brand = settings?.brand_name || 'Bnoy Studios';
  const tagline = settings?.brand_tagline || 'Premium web & mobile codebases, ready to ship in minutes.';
  const heroVideo = settings?.hero_video_url || null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Hero word stagger
      gsap.from('.bnoy-hero-word', {
        y: 80, opacity: 0, rotateX: 60, stagger: 0.08, duration: 1.1, ease: 'power4.out', delay: 0.1,
      });
      gsap.from('.bnoy-hero-fade', {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out', delay: 0.5,
      });
      // Floating layers parallax on scroll
      gsap.to('.bnoy-layer-slow', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true } as any });
      gsap.to('.bnoy-layer-fast', { yPercent: -25, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true } as any });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const headline = ['Buy', 'ship-ready', 'projects.'];
  const headline2 = ['Launch', 'in', 'minutes.'];

  return (
    <section ref={sectionRef} className="relative min-h-[100vh] flex items-center overflow-hidden pt-28 pb-16 bg-ink text-white">
      {/* LAYER 1 — background video / image */}
      <div className="absolute inset-0 -z-10">
        {heroVideo ? (
          <video src={heroVideo} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-50" />
        ) : (
          <img src={bnoyHero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" width={1920} height={1080} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
      </div>

      {/* LAYER 2 — animated grid */}
      <div className="absolute inset-0 -z-10 opacity-[0.08] bnoy-layer-slow"
           style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '60px 60px',
                    maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)' }} />

      {/* LAYER 3 — orange aura blobs */}
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 8 }}
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bnoy-layer-fast pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, hsl(14 100% 56% / 0.55), transparent)' }} />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 10, delay: 1 }}
        className="absolute -bottom-32 -right-20 w-[600px] h-[600px] rounded-full bnoy-layer-fast pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, hsl(43 100% 50% / 0.45), transparent)' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Copy */}
          <div className="lg:col-span-7">
            <div className="bnoy-hero-fade inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-semibold">
              <img src={bnoyLogo} alt="" className="h-4 w-4 object-contain" />
              <Sparkles className="h-3.5 w-3.5 text-fire" />
              <span className="tracking-[0.18em] uppercase">{brand}</span>
            </div>

            <h1 ref={headlineRef} className="mt-5 font-display text-5xl sm:text-6xl lg:text-[80px] font-extrabold leading-[0.98] tracking-tight">
              {headline.map((w, i) => (
                <span key={i} className="bnoy-hero-word inline-block mr-3">{w}</span>
              ))}
              <br />
              {headline2.map((w, i) => (
                <span key={i} className="bnoy-hero-word inline-block mr-3 bg-gradient-to-br from-fire via-sun to-fire bg-clip-text text-transparent">{w}</span>
              ))}
            </h1>

            <p className="bnoy-hero-fade mt-6 text-lg text-white/70 max-w-xl">{tagline}</p>

            <div className="bnoy-hero-fade mt-8 flex flex-wrap gap-3">
              <Link to="/marketplace">
                <Button data-magnetic size="lg" className="bg-white text-ink hover:bg-white/90 px-7">
                  Browse Projects <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {isAdmin ? (
                <Link to="/admin"><Button data-magnetic size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">Admin Panel</Button></Link>
              ) : (
                <Button data-magnetic size="lg" variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white" onClick={() => setShowAuthModal(true, 'Sign in to start buying.')}>
                  <Play className="mr-2 h-4 w-4 fill-current" /> Get Started
                </Button>
              )}
            </div>

            <div className="bnoy-hero-fade mt-8 flex flex-wrap gap-3">
              <Pill icon={<Sparkles className="h-3.5 w-3.5 text-fire" />}>50+ Projects</Pill>
              <Pill icon={<Star className="h-3.5 w-3.5 text-sun" />}>4.9 Rating</Pill>
              <Pill icon={<ShieldCheck className="h-3.5 w-3.5 text-fire" />}>Secure Checkout</Pill>
            </div>
          </div>

          {/* Right composition */}
          <div className="lg:col-span-5 relative h-[480px] hidden lg:block">
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
              className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden bnoy-layer-slow">
              <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-red-500" /><span className="w-3 h-3 rounded-full bg-yellow-500" /><span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs text-white/50 font-mono flex items-center gap-1.5"><Zap className="h-3 w-3 text-fire" /> bnoy.studio</span>
              </div>
              <div className="absolute inset-0 top-10 flex items-center justify-center p-6">
                <CpuArchitecture text="BNOY" className="text-fire/80 max-w-[420px]" />
              </div>
            </motion.div>

            <motion.div className="absolute -top-6 -right-6 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-2xl border border-white/40 w-44 rotate-[5deg] bnoy-layer-fast"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <div className="text-xs text-muted-foreground">✅ Production Ready</div>
              <div className="font-display font-bold text-ink mt-1">PulseChat AI</div>
              <div className="text-fire font-bold text-sm">₹2,499</div>
            </motion.div>
            <motion.div className="absolute top-1/2 -left-8 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold text-ink -rotate-3"
              animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              ⚡ Instant Deploy
            </motion.div>
            <motion.div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-2xl border border-white/40 w-44 bnoy-layer-fast"
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
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-sm font-medium text-white">
      {icon}{children}
    </div>
  );
}
