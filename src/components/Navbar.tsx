import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, User, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.9]);
  const blur = useTransform(scrollY, [0, 100], [0, 20]);
  const padding = useTransform(scrollY, [0, 100], [24, 12]);
  
  const { user, isAdmin, setShowAuthModal } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'About', href: '/#about' },
  ];

  return (
    <motion.nav
      style={{
        backgroundColor: `hsla(222, 47%, 7%, ${bgOpacity.get()})`,
        backdropFilter: `blur(${blur.get()}px)`,
        paddingTop: padding,
        paddingBottom: padding,
      }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-colors"
    >
      <motion.div
        style={{ paddingTop: padding, paddingBottom: padding }}
        className="container mx-auto flex items-center justify-between px-4"
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold gradient-text">DevMarket</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.label} to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)}>
                Login
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90" onClick={() => setShowAuthModal(true)}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </motion.div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden glass-strong border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm py-2">Admin Panel</Link>}
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm py-2">Dashboard</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-sm py-2 text-left text-destructive">Logout</button>
              </>
            ) : (
              <Button size="sm" onClick={() => { setShowAuthModal(true); setMobileOpen(false); }}>Login / Sign Up</Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
