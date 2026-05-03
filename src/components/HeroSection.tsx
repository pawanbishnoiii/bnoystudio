import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import heroDashboard from '@/assets/hero-dashboard.png';

export default function HeroSection() {
  const { isAdmin, setShowAuthModal } = useAuthStore();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-gradient pt-20">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ y: [0, -30, 0], x: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <motion.div animate={{ y: [0, 20, 0], x: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent mb-6">
              <Zap className="h-4 w-4" />
              Production-Ready Vercel Projects
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
              Premium Web Projects.{' '}
              <span className="gradient-text">Buy. Launch. Scale.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg text-muted-foreground max-w-xl mb-8 mx-auto lg:mx-0">
              Discover handcrafted, production-ready web projects built with modern technologies. Deploy on Vercel in minutes and start scaling your business.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/marketplace">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 neon-glow">
                  Browse Marketplace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {isAdmin ? (
                <Link to="/admin">
                  <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
                    Admin Panel
                  </Button>
                </Link>
              ) : (
                <Button size="lg" variant="outline" className="border-border hover:bg-secondary" onClick={() => setShowAuthModal(true)}>
                  Get Started
                </Button>
              )}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div initial={{ opacity: 0, x: 40, rotateY: -10 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 1, delay: 0.3 }} className="relative hidden lg:block">
            <div className="relative animated-gradient-border rounded-2xl overflow-hidden">
              <img src={heroDashboard} alt="Premium web dashboard" width={1024} height={768} className="w-full rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
            {/* Floating badge */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -bottom-4 -left-4 glass rounded-xl px-4 py-3 neon-glow">
              <p className="text-xs text-muted-foreground">Total Projects</p>
              <p className="text-xl font-display font-bold gradient-text">50+</p>
            </motion.div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-4 -right-4 glass rounded-xl px-4 py-3 cyan-glow">
              <p className="text-xs text-muted-foreground">Happy Buyers</p>
              <p className="text-xl font-display font-bold text-accent">200+</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
