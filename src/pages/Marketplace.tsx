import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import ProjectCard from '@/components/ProjectCard';
import PreviewModal from '@/components/PreviewModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user, setShowAuthModal } = useAuthStore();
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['marketplace-projects'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*').eq('status', 'published');
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('name').order('name');
      return data?.map((c: any) => c.name) || [];
    },
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="min-h-screen bg-background">
      <Navbar />
      <AuthModal />

      {/* Cinematic hero with Lottie */}
      <section className="relative pt-28 pb-10 bg-gradient-to-br from-warm-bg via-white to-warm-bg overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl pointer-events-none"
             style={{ background: 'radial-gradient(closest-side, hsl(14 100% 56% / 0.4), transparent)' }} />
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-6 items-center relative">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border shadow-card text-xs font-bold tracking-[0.18em] uppercase text-fire">
              <Sparkles className="h-3.5 w-3.5" /> Bnoy Marketplace
            </span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-extrabold text-ink leading-[1.02] tracking-tight">
              Let some <span className="gradient-text">light in.</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg text-base">
              Browse every published project. Filter by stack, price or category — preview live, then buy with one click.
            </p>
          </div>
          <div className="max-w-[360px] mx-auto w-full h-[220px] md:h-[260px]">
            <DotLottieReact src="/lottie/let-some-light-in.json" loop autoplay />
          </div>
        </div>
      </section>


      {/* Compact modern filter bar */}
      <section className="py-4 bg-white/95 border-b border-border sticky top-16 z-30 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, tech, categories…"
                className="pl-10 h-10 bg-warm-bg/60 border-border rounded-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 w-[130px] rounded-full md:hidden"><SelectValue /></SelectTrigger>
                <SelectContent>{allCats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={priceFilter} onValueChange={(v: any) => setPriceFilter(v)}>
                <SelectTrigger className="h-10 w-[110px] rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v: any) => setSort(v)}>
                <SelectTrigger className="h-10 w-[130px] rounded-full"><SlidersHorizontal className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="price-asc">Price ↑</SelectItem>
                  <SelectItem value="price-desc">Price ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Desktop category pills (compact, scrollable) */}
          <div className="hidden md:flex gap-1.5 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
            {allCats.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                  category === c
                    ? 'gradient-fire-strong text-white border-transparent shadow-card'
                    : 'border-border bg-white text-muted-foreground hover:text-fire hover:border-fire/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid with grouped sections */}
      <section className="py-12 bg-white">
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
                // When the user is browsing "All" with no search, split into curated bands.
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
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No projects match your filters.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setCategory('All'); setPriceFilter('all'); }}>Clear filters</Button>
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
