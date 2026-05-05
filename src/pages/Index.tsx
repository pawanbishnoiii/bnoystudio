import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import HeroSection from '@/components/HeroSection';
import MarqueeTicker from '@/components/MarqueeTicker';

import FeaturedProducts from '@/components/FeaturedProducts';
import HowItWorks from '@/components/HowItWorks';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import CTABanner from '@/components/CTABanner';
import Footer from '@/components/Footer';
import TechMarquee from '@/components/TechMarquee';
import { ScannerCardStream } from '@/components/ui/scanner-card-stream';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SocialProofTicker from '@/components/SocialProofTicker';
import ProgressBar from '@/components/ProgressBar';
import BackToTop from '@/components/BackToTop';
import { useGSAPAnimations, useMagneticButtons } from '@/hooks/useGSAPAnimations';
import { motion } from 'framer-motion';

export default function Index() {
  useGSAPAnimations();
  useMagneticButtons();

  const { data: scanImages = [] } = useQuery({
    queryKey: ['scanner-thumbs'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('thumbnail_url').eq('status', 'published').not('thumbnail_url', 'is', null).limit(8);
      return (data || []).map((d: any) => d.thumbnail_url).filter(Boolean);
    },
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="min-h-screen bg-background">
      <ProgressBar />
      <Navbar />
      <AuthModal />
      <HeroSection />
      <TechMarquee />

      {/* Scanner Card Stream — interactive showcase */}
      <section className="relative py-20 bg-ink overflow-hidden">
        <div className="container mx-auto px-4 mb-10 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.3em] text-fire uppercase mb-4">⚡ Live Scanner</span>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight">Decoding the <span className="gradient-text">marketplace</span></h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto text-sm">Hover or drag to scan through real production builds.</p>
        </div>
        <ScannerCardStream cardImages={scanImages.length > 0 ? scanImages : undefined} height={260} />
      </section>

      <FeaturedProducts limit={6} />

      {/* Lottie strip */}
      <section className="py-12 bg-warm-bg/50">
        <div className="container mx-auto px-4 grid md:grid-cols-3 items-center gap-8">
          <div className="md:col-span-1 max-w-[280px] mx-auto">
            <DotLottieReact src="https://lottie.host/b2f358e6-20fa-4646-8a8c-cb8d461d1f04/FqOqJH6vQN.lottie" loop autoplay />
          </div>
          <div className="md:col-span-2 text-center md:text-left">
            <h3 className="font-display text-3xl md:text-4xl font-extrabold text-ink leading-tight">Ship faster. <span className="gradient-text">Skip the boilerplate.</span></h3>
            <p className="text-muted-foreground mt-3 max-w-xl">Every build comes with auth, payments, dashboards and CI ready out-of-the-box. Just clone, configure, and launch.</p>
          </div>
        </div>
      </section>

      <HowItWorks />
      <TestimonialsSection />
      <FAQSection />
      <SocialProofTicker />
      <CTABanner />
      <Footer />
      <BackToTop />
    </motion.div>
  );
}
