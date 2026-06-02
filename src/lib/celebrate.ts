import { toast } from 'sonner';

/** Fires a celebration toast with an emoji burst + persists across one route change. */
export function celebrate(title: string, description?: string) {
  toast.success(title, {
    description,
    duration: 4500,
    className: 'bnoy-celebrate',
    icon: '🎉',
  });
  // Tiny confetti via DOM — zero deps, respects reduced-motion.
  if (typeof window === 'undefined') return;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  const layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(layer);
  const colors = ['#FF5722', '#FFC107', '#22c55e', '#0ea5e9', '#a855f7'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('span');
    const size = 6 + Math.random() * 8;
    p.style.cssText = `position:absolute;top:30%;left:${20 + Math.random() * 60}%;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};opacity:0;transform:translateY(0) rotate(0deg);transition:transform 1.2s cubic-bezier(.2,.8,.3,1),opacity 1.2s`;
    layer.appendChild(p);
    requestAnimationFrame(() => {
      p.style.opacity = '1';
      p.style.transform = `translate(${(Math.random() - 0.5) * 400}px, ${300 + Math.random() * 400}px) rotate(${Math.random() * 720}deg)`;
    });
  }
  setTimeout(() => layer.remove(), 1600);
}
