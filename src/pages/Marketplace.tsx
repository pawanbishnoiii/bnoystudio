import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
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
      <div className="pt-28 pb-6 warm-bg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-ink">
            The <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Browse every published project. Filter, search and buy in one click.</p>
        </div>
      </div>

      {/* Search + Filters */}
      <section className="py-8 bg-white border-b border-border sticky top-16 z-30 backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, tech, categories…"
                className="pl-10 h-11 bg-warm-bg border-border"
              />
            </div>
            <Select value={priceFilter} onValueChange={(v: any) => setPriceFilter(v)}>
              <SelectTrigger className="md:w-32 h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v: any) => setSort(v)}>
              <SelectTrigger className="md:w-40 h-11"><SlidersHorizontal className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {allCats.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? 'default' : 'outline'}
                onClick={() => setCategory(c)}
                className={category === c ? 'gradient-fire-strong text-white border-0' : 'border-border bg-white text-ink hover:text-fire'}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
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
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} project{filtered.length !== 1 && 's'} found</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((project: any, i: number) => (
                  <ProjectCard key={project.id} project={project} index={i} onPreview={setPreviewUrl} onBuy={handleBuy} />
                ))}
              </div>
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
