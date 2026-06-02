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
    // Smooth blur + curtain wipe — 120fps friendly (transform + filter only, no layout).
    gsap.fromTo(el,
      { scaleY: 0, transformOrigin: 'top', filter: 'blur(0px)' },
      { scaleY: 1, duration: 0.42, ease: 'expo.inOut', filter: 'blur(14px)',
        onComplete: () => {
          gsap.to(el, { scaleY: 0, transformOrigin: 'bottom', duration: 0.5, delay: 0.04, ease: 'expo.out', filter: 'blur(0px)' });
        }
      });
  }, [pathname]);

  return (
    <div ref={ref} aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[150] bg-gradient-to-br from-ink via-ink/95 to-fire/70 origin-top"
      style={{ transform: 'scaleY(0)', willChange: 'transform, filter' }} />
  );
}
