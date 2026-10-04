import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ClayIcon, ClayIconName } from '@/components/ui/clay-icon';
import clayFactory from '@/assets/generated/clay-launch-factory.webp';
import craftStillLife from '@/assets/generated/craft-still-life.webp';

gsap.registerPlugin(ScrollTrigger);

const chapters: Array<{ no: string; icon: ClayIconName; title: string; copy: string }> = [
  { no: '01', icon: 'code', title: 'Start with proven architecture.', copy: 'Production patterns, responsive systems and real product depth—not another decorative template.' },
  { no: '02', icon: 'modules', title: 'Make every layer yours.', copy: 'Swap the identity, content and modules without untangling the core experience or delivery logic.' },
  { no: '03', icon: 'rocket', title: 'Move from edit to orbit.', copy: 'Deploy with a clean handoff, focused documentation and a codebase designed for the next iteration.' },
];

export default function StudioStory() {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!root.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=180%', pin: true, scrub: 1 } })
          .to('.story-primary', { clipPath: 'inset(0 0 100% 0 round 28px)', scale: 1.08, ease: 'none' }, .4)
          .fromTo('.story-secondary', { scale: 1.12 }, { scale: 1, ease: 'none' }, .4)
          .to('.story-orbit', { rotate: 160, ease: 'none' }, 0)
          .to('.story-copy-track', { yPercent: -43, ease: 'none' }, 0);
      });
      gsap.from('.story-card', { opacity: 0, y: 44, stagger: .12, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      return () => mm.revert();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-[#f3efe8] py-24 lg:h-screen lg:py-0">
      <div className="story-orbit absolute -right-40 top-20 h-[520px] w-[520px] rounded-full border border-ink/10 before:absolute before:left-10 before:top-12 before:h-4 before:w-4 before:rounded-full before:bg-fire" />
      <div className="container relative mx-auto grid h-full items-center gap-12 px-4 lg:grid-cols-2">
        <div className="relative aspect-[4/4.5] overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_40px_100px_-50px_rgba(7,11,20,.45)] lg:aspect-[4/4.2]">
          <img src={craftStillLife} alt="A crafted glass product object in a sunlit studio" loading="lazy" className="story-secondary absolute inset-0 h-full w-full object-cover" />
          <img src={clayFactory} alt="Clay-style launch factory assembling digital products" loading="lazy" className="story-primary absolute inset-0 z-10 h-full w-full object-cover" style={{ clipPath: 'inset(0 0 0 0 round 28px)' }} />
          <div className="absolute bottom-5 left-5 z-20 rounded-full border border-white/30 bg-[#070b14]/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[.24em] text-white backdrop-blur-xl">From modules to momentum</div>
        </div>
        <div className="max-h-[72vh] overflow-hidden lg:h-[66vh]">
          <div className="story-copy-track">
            <div className="mb-20 pt-4 lg:min-h-[62vh]">
              <span className="studio-kicker text-fire">How Bnoy works</span>
              <h2 className="mt-6 max-w-xl font-display text-5xl font-extrabold leading-[.96] tracking-[-.05em] text-ink md:text-7xl">A better starting point changes the finish.</h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">Scroll through a build system designed to remove repetitive setup while preserving the creative decisions that make a product distinct.</p>
            </div>
            <div className="space-y-4 lg:min-h-[62vh]">
              {chapters.map((chapter) => <article key={chapter.no} className="story-card studio-card group grid grid-cols-[auto_1fr_auto] items-center gap-4 p-5 sm:p-6"><ClayIcon name={chapter.icon} className="h-16 w-16 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3" /><div><span className="text-[10px] font-bold tracking-[.24em] text-fire">{chapter.no}</span><h3 className="mt-1 font-display text-lg font-bold text-ink sm:text-xl">{chapter.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{chapter.copy}</p></div><ArrowUpRight className="h-5 w-5 text-ink/30" /></article>)}
              <Link to="/marketplace" className="studio-button mt-5">Find your foundation <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
