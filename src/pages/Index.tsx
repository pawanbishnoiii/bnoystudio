import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import HeroSection from '@/components/HeroSection';
import MarqueeTicker from '@/components/MarqueeTicker';
import StatsSection from '@/components/StatsSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import HowItWorks from '@/components/HowItWorks';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import NewsletterSection from '@/components/NewsletterSection';
import Footer from '@/components/Footer';

export default function Index() {
  const { setUser, setSession } = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [setUser, setSession]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <AuthModal />
      <HeroSection />
      <MarqueeTicker />
      <StatsSection />
      <FeaturedProducts limit={6} />
      <HowItWorks />
      <TestimonialsSection />
      <FAQSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
