import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';

export default function Marketplace() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <AuthModal />
      <div className="pt-20">
        <FeaturedProducts showFilters />
      </div>
      <Footer />
    </div>
  );
}
