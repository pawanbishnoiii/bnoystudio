import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Runs the landing-page GSAP suite: hero text reveal, parallax, pinned horizontal scroll,
 *  step underlines, staggered section reveals, sticky progress bar. */
export function useGSAPAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero word reveal
      const words = gsap.utils.toArray<HTMLElement>('.hero-word');
      if (words.length) {
        gsap.from(words, { y: 80, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 });
      }

      // 2. Parallax floating cards
      gsap.utils.toArray<HTMLElement>('.parallax-card').forEach((el) => {
        const speed = parseFloat(el.dataset.speed || '0.3');
        gsap.to(el, {
          y: -120 * speed,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      // 3. Pinned horizontal scroll featured strip
      const track = document.querySelector<HTMLElement>('.featured-track');
      const section = document.querySelector<HTMLElement>('.featured-section');
      if (track && section) {
        const cards = track.querySelectorAll('.featured-card');
        if (cards.length > 1) {
          gsap.to(track, {
            xPercent: -100 * (cards.length - 1) / cards.length * (cards.length / cards.length),
            x: () => -(track.scrollWidth - window.innerWidth + 64),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              pin: true,
              scrub: 1,
              end: () => '+=' + (track.scrollWidth - window.innerWidth + 200),
            },
          });
        }
      }

      // 4. Step underline draw
      gsap.utils.toArray<HTMLElement>('.step-underline').forEach((el) => {
        gsap.fromTo(el,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%' } });
      });

      // 5. Staggered section reveals
      gsap.utils.toArray<HTMLElement>('.reveal-stagger').forEach((container) => {
        const items = container.querySelectorAll<HTMLElement>('.reveal-item');
        if (items.length) {
          gsap.from(items, {
            opacity: 0, y: 50, duration: 0.7, ease: 'power2.out', stagger: 0.12,
            scrollTrigger: { trigger: container, start: 'top 80%' },
          });
        }
      });

      // 6. Sticky progress bar
      const bar = document.querySelector('.progress-bar');
      if (bar) {
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: 1, transformOrigin: 'left center', ease: 'none',
          scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: true },
        });
      }
    });

    return () => { ctx.revert(); ScrollTrigger.killAll(); };
  }, []);
}

/** Magnetic hover effect for buttons (attach with data-magnetic attribute). */
export function useMagneticButtons() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-magnetic]');
    const handlers: Array<{ el: HTMLElement; move: any; leave: any }> = [];
    els.forEach((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 16;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 16;
        gsap.to(el, { x, y, duration: 0.3, ease: 'power3.out' });
      };
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      handlers.push({ el, move, leave });
    });
    return () => handlers.forEach(({ el, move, leave }) => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    });
  }, []);
}
