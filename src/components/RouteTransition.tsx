import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Dark curtain wipe between routes. Fully bypassed under reduced-motion. */
export default function RouteTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (prefersReducedMotion() || !ref.current) return;
    const el = ref.current;
    gsap.fromTo(el,
      { scaleY: 0, transformOrigin: 'top' },
      { scaleY: 1, duration: 0.35, ease: 'power3.in',
        onComplete: () => {
          gsap.to(el, { scaleY: 0, transformOrigin: 'bottom', duration: 0.45, delay: 0.05, ease: 'power3.out' });
        }
      });
  }, [pathname]);

  return (
    <div ref={ref} aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[150] bg-gradient-to-br from-ink via-ink to-fire/80 origin-top"
      style={{ transform: 'scaleY(0)' }} />
  );
}
