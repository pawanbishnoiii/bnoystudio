import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const positions = [
  { className: 'w-[25vw] h-[25vh] -top-[30vh] left-[5vw]' },
  { className: 'w-[35vw] h-[30vh] top-[5vh] left-[-25vw]' },
  { className: 'w-[20vw] h-[45vh] -top-[10vh] left-[27.5vw]' },
  { className: 'w-[25vw] h-[25vh] left-[5vw] top-[27.5vh]' },
  { className: 'w-[20vw] h-[25vh] left-[-22.5vw] top-[27.5vh]' },
  { className: 'w-[30vw] h-[25vh] left-[27.5vw] top-[27.5vh]' },
  { className: 'w-[25vw] h-[25vh] left-[27.5vw] top-[27.5vh]' },
];

const scales = [4, 5, 6, 5, 6, 8, 9];

function Pic({ src, className, scale }: { src: string; className: string; scale: MotionValue<number> }) {
  return (
    <motion.div style={{ scale }} className={`absolute ${className}`}>
      <div className="relative w-full h-full">
        <img src={src} alt="" className="w-full h-full object-cover rounded-2xl shadow-2xl" />
      </div>
    </motion.div>
  );
}

export default function ZoomParallax() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });

  const { data: projects } = useQuery({
    queryKey: ['zoom-parallax-projects'],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('thumbnail_url, screenshots')
        .eq('status', 'published')
        .limit(7);
      return data || [];
    },
  });

  const fallback = '/placeholder.svg';
  const imgs: string[] = [];
  (projects || []).forEach((p: any) => {
    if (p.thumbnail_url) imgs.push(p.thumbnail_url);
    (p.screenshots || []).forEach((s: string) => s && imgs.push(s));
  });
  while (imgs.length < 7) imgs.push(fallback);

  const transforms = scales.map((s) => useTransform(scrollYProgress, [0, 1], [1, s]));

  return (
    <section className="bg-white">
      <div className="text-center py-20">
        <p className="text-xs font-semibold tracking-[0.3em] text-fire uppercase mb-3">Showcase</p>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold text-ink">
          A look inside our <span className="gradient-text">premium projects</span>
        </h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto px-4">Scroll to zoom into real screenshots from the marketplace.</p>
      </div>
      <div ref={container} className="relative h-[300vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          {imgs.slice(0, 7).map((src, i) => (
            <Pic key={i} src={src} className={positions[i].className} scale={transforms[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}
