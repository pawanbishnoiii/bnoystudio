import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, LayoutDashboard, ShoppingBag, Search, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAdmin, setShowAuthModal } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/'); };
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) navigate(`/marketplace?q=${encodeURIComponent(q)}`);
  };

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Apps', href: '/apps' },
    { label: 'How it works', href: '/#how' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <motion.nav
      animate={{ paddingTop: scrolled ? 8 : 18, paddingBottom: scrolled ? 8 : 18 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors ${scrolled ? 'bg-white/85 backdrop-blur-xl border-b border-border shadow-card' : 'bg-transparent'}`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-fire-strong flex items-center justify-center glow-fire">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-extrabold text-ink">Dev<span className="gradient-text">Market</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.label} to={l.href} className="text-sm font-medium text-muted-foreground hover:text-fire transition-colors">{l.label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <AnimatePresence>
            {searchOpen && (
              <motion.input
                initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                autoFocus value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onBlur={() => !searchQuery && setSearchOpen(false)}
                placeholder="Search projects…"
                className="px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-fire/40"
              />
            )}
          </AnimatePresence>
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen((s) => !s)} aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>

          {user ? (
            <>
              {isAdmin && <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}><LayoutDashboard className="h-5 w-5 mr-2" />Admin</Button>}
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}><User className="h-5 w-5 mr-2" />Dashboard</Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-5 w-5 mr-2" />Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)}><LogIn className="h-5 w-5 mr-2" />Login</Button>
              <Button size="sm" className="gradient-fire-strong text-white hover:opacity-95" onClick={() => setShowAuthModal(true)}><UserPlus className="h-5 w-5 mr-2" />Sign Up</Button>
            </>
          )}
        </div>

        <button className="md:hidden text-ink" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-white border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search projects…"
              className="px-3 py-2 rounded-lg border border-border bg-white text-sm mb-2"
            />
            {links.map((l) => (
              <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">{l.label}</Link>
            ))}
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm py-2">Admin Panel</Link>}
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm py-2">Dashboard</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-sm py-2 text-left text-destructive">Logout</button>
              </>
            ) : (
              <Button size="sm" className="gradient-fire-strong text-white" onClick={() => { setShowAuthModal(true); setMobileOpen(false); }}>Login / Sign Up</Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
