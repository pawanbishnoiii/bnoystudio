import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProjectCard from '@/components/ProjectCard';
import PreviewModal from '@/components/PreviewModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const categories = ['All', 'Free', 'Paid', 'React', 'Next.js', 'E-Commerce', 'Portfolio', 'Dashboard'];

interface FeaturedProductsProps {
  limit?: number;
  showFilters?: boolean;
}

export default function FeaturedProducts({ limit, showFilters = true }: FeaturedProductsProps) {
  const [category, setCategory] = useState('All');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const { user, setShowAuthModal } = useAuthStore();
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = projects?.filter((p) => {
    if (category === 'All') return true;
    if (category === 'Free') return p.price === 0;
    if (category === 'Paid') return p.price > 0;
    return p.category?.includes(category) || p.tech_stack?.includes(category);
  });

  const displayed = limit ? filtered?.slice(0, limit) : filtered;

  const handleBuy = async (project: any) => {
    if (!user) {
      setShowAuthModal(true, project.price === 0
        ? 'Sign in to download this free project.'
        : `Sign in to buy "${project.title}".`);
      return;
    }
    if (project.price === 0) {
      const { error } = await supabase.from('purchases').insert({ user_id: user.id, project_id: project.id, amount: 0 });
      if (error && !error.message.includes('duplicate')) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Project unlocked!', description: 'Open your dashboard to download the source code.' });
      return;
    }
    toast({
      title: 'Payment gateway coming soon',
      description: 'Razorpay integration will activate once API keys are configured.',
    });
  };

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-ink">
            Featured <span className="gradient-text">projects</span>
          </h2>
          <p className="text-muted-foreground mt-3">Handcrafted, production-ready web projects.</p>
        </motion.div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory(cat)}
                className={category === cat ? 'gradient-fire-strong text-white border-0' : 'border-border bg-white text-ink hover:text-fire'}
              >
                {cat}
              </Button>
            ))}
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="aspect-video" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed && displayed.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onPreview={setPreviewUrl}
                onBuy={handleBuy}
              />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-muted-foreground text-lg">No projects found. Check back soon!</p>
          </motion.div>
        )}
      </div>

      <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
    </section>
  );
}
