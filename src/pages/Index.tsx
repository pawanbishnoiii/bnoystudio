import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import HeroSection from '@/components/HeroSection';
import MarqueeTicker from '@/components/MarqueeTicker';
import StatsSection from '@/components/StatsSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import HowItWorks from '@/components/HowItWorks';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import CTABanner from '@/components/CTABanner';
import Footer from '@/components/Footer';
import FeatureCards from '@/components/FeatureCards';
import TechMarquee from '@/components/TechMarquee';
import IllustrationStrip from '@/components/IllustrationStrip';
import SocialProofTicker from '@/components/SocialProofTicker';
import ProgressBar from '@/components/ProgressBar';
import BackToTop from '@/components/BackToTop';
import { useGSAPAnimations, useMagneticButtons } from '@/hooks/useGSAPAnimations';
import { motion } from 'framer-motion';

export default function Index() {
  useGSAPAnimations();
  useMagneticButtons();

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
      <FeatureCards />
      <StatsSection />
      <FeaturedProducts limit={6} />
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
