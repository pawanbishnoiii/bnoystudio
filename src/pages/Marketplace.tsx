import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import ProjectCard from '@/components/ProjectCard';
import PreviewModal from '@/components/PreviewModal';
import SearchBar from '@/components/marketplace/SearchBar';

import { Button } from '@/components/ui/button';
import { ClayIcon } from '@/components/ui/clay-icon';
import clayFactory from '@/assets/generated/clay-launch-factory.webp';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

type Price = 'all' | 'free' | 'paid';
type Sort = 'newest' | 'price-asc' | 'price-desc' | 'popular';

export default function Marketplace() {
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get('q') || '');
  const search = useDebouncedValue(searchInput, 300);
  const category = params.get('category') || 'All';
  const priceFilter = (params.get('price') as Price) || 'all';
  const sort = (params.get('sort') as Sort) || 'newest';

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user, setShowAuthModal } = useAuthStore();
  const { toast } = useToast();

  // Keep URL in sync with debounced search so back/forward + share work.
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (search.trim()) next.set('q', search.trim()); else next.delete('q');
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
  }, [search]); // eslint-disable-line

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'All' && value !== 'all' && value !== 'newest') next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const { data: projects, isLoading } = useQuery({
    queryKey: ['marketplace-projects'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*').eq('status', 'published');
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await supabase.from('categories').select('name').order('name')).data?.map((c: any) => c.name) || [],
  });

  const filtered = useMemo(() => {
    let list = projects || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.short_desc?.toLowerCase().includes(q) ||
        (p.tech_stack || []).some((t: string) => t.toLowerCase().includes(q)) ||
        (p.category || []).some((c: string) => c.toLowerCase().includes(q))
      );
    }
    if (category !== 'All') list = list.filter((p: any) => (p.category || []).includes(category));
    if (priceFilter === 'free') list = list.filter((p: any) => p.price === 0);
    if (priceFilter === 'paid') list = list.filter((p: any) => p.price > 0);
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'popular') list = [...list].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    if (sort === 'newest') list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return list;
  }, [projects, search, category, priceFilter, sort]);

  const suggestions = useMemo(() => {
    const set = new Set<string>();
    (projects || []).forEach((p: any) => {
      if (p.title) set.add(p.title);
      (p.tech_stack || []).forEach((t: string) => set.add(t));
      (p.category || []).forEach((c: string) => set.add(c));
    });
    return Array.from(set);
  }, [projects]);

  const handleBuy = async (project: any) => {
    if (!user) {
      setShowAuthModal(true, project.price === 0 ? 'Sign in to download.' : `Sign in to buy "${project.title}".`);
      return;
    }
    if (project.price === 0) {
      const { error } = await supabase.from('purchases').insert({ user_id: user.id, project_id: project.id, amount: 0 });
      if (error && !error.message.includes('duplicate')) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Project unlocked!' });
    }
  };

  const allCats = ['All', ...(categories || [])];
  const activeFilters = [
    category !== 'All' && { key: 'category', label: category },
    priceFilter !== 'all' && { key: 'price', label: priceFilter === 'free' ? 'Free' : 'Paid' },
    sort !== 'newest' && { key: 'sort', label: { 'price-asc': 'Price ↑', 'price-desc': 'Price ↓', 'popular': 'Popular' }[sort] },
    search.trim() && { key: 'q', label: `"${search.trim()}"` },
  ].filter(Boolean) as { key: string; label: string }[];

  const clearAll = () => { setSearchInput(''); setParams(new URLSearchParams(), { replace: true }); };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="studio-shell min-h-screen">
      <Navbar />
      <AuthModal />

      {/* Cinematic hero — typographic, no Lottie. */}
      <section className="studio-dark relative overflow-hidden pb-12 pt-28 text-white md:pb-16">
        <div className="container relative mx-auto grid items-center gap-10 px-4 md:grid-cols-[1fr_.72fr]">
          <div className="max-w-3xl">
            <span className="studio-kicker border-white/10 bg-white/5 text-aqua"><Sparkles className="h-3.5 w-3.5" /> Curated Bnoy collection</span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[.95] tracking-[-.055em] md:text-7xl">Skip the blank canvas.<br/><span className="bg-gradient-to-r from-[#ff896b] to-[#78f3c6] bg-clip-text text-transparent">Start in motion.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/55">Explore production-ready foundations with real product logic. Preview the experience, choose your stack and make it unmistakably yours.</p>
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-sm md:block"><div className="absolute inset-0 overflow-hidden rounded-[32px] border border-white/15 bg-white/5 p-3 rotate-2"><img src={clayFactory} alt="Clay-style digital product factory" className="h-full w-full rounded-[24px] object-cover" /></div><div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/15 bg-[#0b1220]/85 p-3 backdrop-blur-xl"><ClayIcon name="store" className="h-16 w-16" /></div></div>
        </div>
      </section>

      {/* Sticky glass filter bar */}
      <section className="sticky top-16 z-30 border-b border-white/70 bg-white/75 py-4 backdrop-blur-2xl">
        <div className="container mx-auto px-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
            <div className="flex-1 min-w-0">
              <SearchBar value={searchInput} onChange={setSearchInput} suggestions={suggestions} />
            </div>
            <div className="flex gap-2">
              <Select value={category} onValueChange={(v) => setParam('category', v)}>
                <SelectTrigger className="h-10 w-[130px] rounded-full md:hidden"><SelectValue /></SelectTrigger>
                <SelectContent>{allCats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={priceFilter} onValueChange={(v: any) => setParam('price', v)}>
                <SelectTrigger className="h-10 w-[110px] rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v: any) => setParam('sort', v)}>
                <SelectTrigger className="h-10 w-[140px] rounded-full"><SlidersHorizontal className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="price-asc">Price ↑</SelectItem>
                  <SelectItem value="price-desc">Price ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="hidden md:flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {allCats.map((c) => (
              <button key={c} onClick={() => setParam('category', c)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                  category === c ? 'gradient-fire-strong text-white border-transparent shadow-card' : 'border-border bg-white text-muted-foreground hover:text-fire hover:border-fire/40'
                }`}>{c}</button>
            ))}
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Active</span>
              {activeFilters.map((f) => (
                <Badge key={f.key} variant="outline" className="border-fire/30 bg-fire/5 text-fire pl-2.5 pr-1 py-1 gap-1">
                  {f.label}
                  <button onClick={() => { if (f.key === 'q') setSearchInput(''); setParam(f.key, null); }}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-fire/20" aria-label={`Remove ${f.label}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-fire underline-offset-2 hover:underline">Clear all</button>
            </div>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}><Skeleton className="aspect-video rounded-2xl" /><Skeleton className="h-5 w-3/4 mt-3" /></div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">{filtered.length} project{filtered.length !== 1 && 's'} found</p>
              {(() => {
                const showSections = priceFilter === 'all' && !search.trim() && category === 'All';
                if (!showSections) {
                  return (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filtered.map((project: any, i: number) => (
                        <ProjectCard key={project.id} project={project} index={i} onPreview={setPreviewUrl} onBuy={handleBuy} />
                      ))}
                    </div>
                  );
                }
                const featured = filtered.filter((p: any) => p.featured);
                const free = filtered.filter((p: any) => p.price === 0 && !p.featured);
                const paid = filtered.filter((p: any) => p.price > 0 && !p.featured);
                const Section = ({ title, subtitle, items }: { title: string; subtitle: string; items: any[] }) => (
                  items.length === 0 ? null : (
                    <div className="mb-14">
                      <div className="flex items-end justify-between mb-5">
                        <div>
                          <h2 className="font-display text-2xl font-extrabold text-ink tracking-tight">{title}</h2>
                          <p className="text-sm text-muted-foreground">{subtitle}</p>
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase text-fire">{items.length} items</span>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((project: any, i: number) => (
                          <ProjectCard key={project.id} project={project} index={i} onPreview={setPreviewUrl} onBuy={handleBuy} />
                        ))}
                      </div>
                    </div>
                  )
                );
                return (
                  <>
                    <Section title="Featured picks" subtitle="Hand-curated builds we love right now." items={featured} />
                    <Section title="Free starters" subtitle="Battery-included open builds — clone, download, ship." items={free} />
                    <Section title="Premium projects" subtitle="Production-ready codebases for serious launches." items={paid} />
                  </>
                );
              })()}
            </>
          ) : (
            <div className="text-center py-12 max-w-md mx-auto">
              <div className="w-40 h-40 mx-auto grid place-items-center rounded-3xl bg-warm-bg/60 border border-border text-7xl">
                🗂️
              </div>
              <h3 className="font-display text-xl font-bold text-ink mt-4">No projects match your filters</h3>
              <p className="text-muted-foreground text-sm mt-2">Try clearing a few filters or searching for something else.</p>
              <Button variant="outline" className="mt-4" onClick={clearAll}>Clear all filters</Button>
            </div>
          )}
        </div>
      </section>

      <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      <Footer />
      <BackToTop />
    </motion.div>
  );
}
