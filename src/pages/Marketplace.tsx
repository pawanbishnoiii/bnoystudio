import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';

export default function Marketplace() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background">
      <Navbar />
      <AuthModal />
      <div className="pt-28 pb-4 warm-bg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-ink">
            The <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Browse every published project. Filter by category, preview live, and buy in one click.</p>
        </div>
      </div>
      <FeaturedProducts showFilters />
      <Footer />
    </motion.div>
  );
}
