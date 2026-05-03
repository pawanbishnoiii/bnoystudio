import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, ShoppingCart, Download, Play, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import PreviewModal from '@/components/PreviewModal';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user, setShowAuthModal } = useAuthStore();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: purchased } = useQuery({
    queryKey: ['purchased', id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.from('purchases').select('id').eq('user_id', user.id).eq('project_id', id!).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!id,
  });

  const handleBuy = async () => {
    if (!user) { setShowAuthModal(true); return; }
    if (project?.price === 0) {
      await supabase.from('purchases').insert({ user_id: user.id, project_id: project.id, amount: 0 });
      toast({ title: 'Added!', description: 'Check your dashboard for download.' });
      return;
    }
    toast({ title: 'Payment Gateway', description: 'Razorpay integration will be activated once API keys are configured.' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar /><AuthModal />
        <div className="container mx-auto px-4 pt-28">
          <Skeleton className="h-96 w-full rounded-2xl mb-8" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navbar /><AuthModal />
        <div className="text-center"><h2 className="font-display text-2xl font-bold mb-4">Project Not Found</h2><Link to="/marketplace"><Button>Back to Marketplace</Button></Link></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar /><AuthModal />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animated-gradient-border rounded-2xl overflow-hidden">
              <img src={project.thumbnail_url || '/placeholder.svg'} alt={project.title} className="w-full aspect-video object-cover rounded-2xl" />
            </motion.div>

            {/* Screenshots */}
            {project.screenshots && project.screenshots.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.screenshots.map((ss: string, i: number) => (
                  <img key={i} src={ss} alt={`Screenshot ${i + 1}`} loading="lazy" className="rounded-xl aspect-video object-cover border border-border" />
                ))}
              </div>
            )}

            {/* Video */}
            {project.video_url && (
              <div className="aspect-video rounded-2xl overflow-hidden border border-border">
                <iframe src={project.video_url} className="w-full h-full" allowFullScreen title="Project Video" />
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">About This Project</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: project.full_desc || project.short_desc }} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 sticky top-28">
              <h1 className="font-display text-2xl font-bold mb-2">{project.title}</h1>
              <p className="text-muted-foreground text-sm mb-6">{project.short_desc}</p>

              <div className="text-3xl font-display font-bold gradient-text mb-6">
                {project.price === 0 ? 'FREE' : `₹${project.price.toLocaleString('en-IN')}`}
              </div>

              <div className="space-y-3 mb-6">
                {project.preview_url && (
                  <Button variant="outline" className="w-full border-border" onClick={() => setPreviewUrl(project.preview_url)}>
                    <Eye className="h-4 w-4 mr-2" /> Live Preview
                  </Button>
                )}
                {purchased ? (
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-primary-foreground">
                    <Download className="h-4 w-4 mr-2" /> Download Source Code
                  </Button>
                ) : (
                  <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 neon-glow" onClick={handleBuy}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {project.price === 0 ? 'Get Free' : 'Buy with Razorpay'}
                  </Button>
                )}
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="font-display font-semibold text-sm mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack?.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="border-border text-muted-foreground">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {project.category && project.category.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-display font-semibold text-sm mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.category.map((cat: string) => (
                      <Badge key={cat} className="bg-primary/20 text-primary border-0">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      <Footer />
    </div>
  );
}
