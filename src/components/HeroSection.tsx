import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Play, Sparkles } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { ClayIcon, ClayIconName } from '@/components/ui/clay-icon';
import heroOrbit from '@/assets/generated/hero-orbit.webp';
import bnoyLogo from '@/assets/bnoy-logo.png';

gsap.registerPlugin(ScrollTrigger);

const proof: Array<{ icon: ClayIconName; value: string; label: string }> = [
  { icon: 'rocket', value: '50+', label: 'ship-ready builds' },
  { icon: 'shield', value: '100%', label: 'secure handoff' },
  { icon: 'bolt', value: '< 5 min', label: 'to first deploy' },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { isAdmin } = useAuthStore();
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => (await supabase.from('site_settings').select('*').limit(1).maybeSingle()).data,
  });
  const extendedSettings = settings as (typeof settings & { logo_url?: string | null; hero_badge?: string | null; hero_bg_url?: string | null; hero_lottie_url?: string | null });
  const logo = extendedSettings?.logo_url || bnoyLogo;
  const badge = extendedSettings?.hero_badge || 'The fastest route from idea to launch';
  const tagline = settings?.brand_tagline || 'Premium web and mobile products with clean code, considered UX and the infrastructure to scale.';
  const heroVideo = settings?.hero_video_url || null;
  const heroBg = extendedSettings?.hero_bg_url || null;
  const heroLottie = extendedSettings?.hero_lottie_url || null;

  useLayoutEffect(() => {
    if (!sectionRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .from('.hero-kicker', { y: 18, opacity: 0, duration: .65 })
        .from('.hero-line', { yPercent: 115, rotateX: 28, opacity: 0, duration: .95, stagger: .08 }, '-=.35')
        .from('.hero-support', { y: 24, opacity: 0, duration: .7, stagger: .08 }, '-=.55')
        .from('.hero-visual', { x: 46, scale: .94, opacity: 0, duration: 1.1 }, '-=.9');
      gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.1 } })
        .to('.hero-visual', { yPercent: 12, rotate: 1.5, scale: .96, ease: 'none' }, 0)
        .to('.hero-copy', { yPercent: -8, opacity: .35, ease: 'none' }, 0)
        .to('.hero-orbit-dot', { rotate: 160, ease: 'none' }, 0);
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="studio-dark noise-overlay relative min-h-[100svh] overflow-hidden pt-28 text-white">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px)', backgroundSize: '72px 72px', maskImage: 'linear-gradient(to bottom,black,transparent 88%)' }} />
      <div className="hero-orbit-dot absolute -right-40 -top-56 h-[680px] w-[680px] rounded-full border border-white/10 before:absolute before:left-1/2 before:top-[-7px] before:h-3 before:w-3 before:rounded-full before:bg-aqua before:shadow-[0_0_25px_#78f3c6]" />
      <div className="container relative z-10 mx-auto flex min-h-[calc(100svh-7rem)] items-center px-4 pb-14">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div className="hero-copy max-w-3xl">
            <div className="hero-kicker studio-kicker border-white/10 bg-white/5 text-white/70 backdrop-blur-xl"><img src={logo} alt="" className="h-4 w-4 object-contain" /><Sparkles className="h-3.5 w-3.5 text-aqua" /> {badge}</div>
            <h1 className="mt-7 font-display text-[clamp(3.25rem,7vw,7rem)] font-extrabold leading-[.91] tracking-[-.065em]">
              <span className="block overflow-hidden pb-2"><span className="hero-line block">Build less.</span></span>
              <span className="block overflow-hidden pb-3"><span className="hero-line block bg-gradient-to-r from-[#ff8d6e] via-[#ffd2c7] to-[#78f3c6] bg-clip-text text-transparent">Launch beyond.</span></span>
            </h1>
            <p className="hero-support mt-6 max-w-xl text-base leading-7 text-white/60 sm:text-lg">{tagline}</p>
            <div className="hero-support mt-8 flex flex-wrap items-center gap-3">
              <Link to="/marketplace" className="studio-button group" data-magnetic>Explore the collection <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
              {isAdmin ? <Link to="/admin"><Button variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">Open admin</Button></Link> : <HeroStartButton />}
            </div>
            <div className="hero-support mt-10 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
              {proof.map((item) => <div key={item.label} className="group rounded-2xl border border-white/10 bg-white/[.055] p-3 backdrop-blur-xl sm:p-4"><ClayIcon name={item.icon} className="h-10 w-10 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3 sm:h-12 sm:w-12" /><strong className="mt-2 block font-display text-base sm:text-xl">{item.value}</strong><span className="text-[10px] text-white/45 sm:text-xs">{item.label}</span></div>)}
            </div>
          </div>
          <div className="hero-visual gpu-layer relative mx-auto aspect-[4/4.5] w-full max-w-[720px] lg:ml-auto">
            <div className="absolute inset-[6%] overflow-hidden rounded-[2.25rem] border border-white/15 bg-white/[.06] shadow-[0_50px_120px_-40px_rgba(0,0,0,.85)] backdrop-blur-2xl sm:rounded-[3rem]">
              {heroVideo ? <video src={heroVideo} autoPlay muted loop playsInline className="h-full w-full object-cover" /> : heroBg ? <img src={heroBg} alt="" className="h-full w-full object-cover" fetchPriority="high" /> : heroLottie ? <DotLottieReact src={heroLottie} loop autoplay /> : <img src={heroOrbit} alt="Futuristic modular product interface" className="h-full w-full object-cover object-[64%_center]" fetchPriority="high" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/60 via-transparent to-transparent" />
            </div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-[3%] left-0 rounded-2xl border border-white/15 bg-[#0d1422]/80 p-3 pr-5 shadow-2xl backdrop-blur-2xl sm:p-4 sm:pr-7"><div className="flex items-center gap-3"><ClayIcon name="modules" className="h-12 w-12 sm:h-16 sm:w-16" /><div><span className="text-[9px] font-bold uppercase tracking-[.22em] text-aqua">Modular by design</span><p className="mt-1 font-display text-sm font-bold sm:text-base">Own it. Shape it. Ship it.</p></div></div></motion.div>
            <motion.div animate={{ y: [0, 8, 0], rotate: [2, 0, 2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-0 top-[8%] grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl sm:h-20 sm:w-20"><ClayIcon name="magic" className="h-14 w-14 sm:h-[72px] sm:w-[72px]" /></motion.div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[9px] font-bold uppercase tracking-[.28em] text-white/35 md:flex"><Play className="h-3 w-3 fill-current" /> Scroll to enter the studio</div>
    </section>
  );
}

function HeroStartButton() {
  const { user, setShowAuthModal } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const onClick = () => { setLoading(true); window.setTimeout(() => { if (user) navigate('/dashboard'); else setShowAuthModal(true, 'Sign in to start building.'); setLoading(false); }, 320); };
  return <Button onClick={onClick} disabled={loading} variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">{loading ? 'Opening…' : 'Start building'}</Button>;
}
