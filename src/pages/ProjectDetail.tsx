import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, ShoppingCart, Download, Lock } from 'lucide-react';
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
  const [downloading, setDownloading] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: purchase, refetch: refetchPurchase } = useQuery({
    queryKey: ['purchase', id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('purchases').select('*').eq('user_id', user.id).eq('project_id', id!).maybeSingle();
      return data;
    },
    enabled: !!user && !!id,
  });

  const isFree = project?.price === 0;
  const purchased = !!purchase || (isFree && !!user); // free still requires login but unlocks immediately on click

  const handleBuy = async () => {
    if (!user) {
      setShowAuthModal(true, isFree ? 'Sign in to download this free project.' : `Sign in to buy "${project?.title}".`);
      return;
    }
    if (isFree) {
      const { error } = await supabase.from('purchases').insert({ user_id: user.id, project_id: project!.id, amount: 0 });
      if (error && !error.message.includes('duplicate')) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      await refetchPurchase();
      toast({ title: 'Unlocked!', description: 'You can now download the source code.' });
      return;
    }
    toast({ title: 'Payment gateway coming soon', description: 'Razorpay will activate once API keys are added.' });
  };

  const handleDownload = async () => {
    if (!project) return;
    setDownloading(true);
    try {
      // If admin uploaded a public source URL, use it directly
      if (project.source_code_url) {
        window.open(project.source_code_url, '_blank', 'noopener');
        return;
      }
      // Otherwise try a signed URL from the private 'source-code' bucket
      // Convention: source-code/{project_id}/source.zip
      const path = `${project.id}/source.zip`;
      const { data, error } = await supabase.storage.from('source-code').createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank', 'noopener');
    } catch (e: any) {
      toast({ title: 'Download unavailable', description: e.message || 'Source code not yet uploaded.', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background"><Navbar /><AuthModal />
        <div className="container mx-auto px-4 pt-28">
          <Skeleton className="h-96 w-full rounded-2xl mb-8" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Navbar /><AuthModal />
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Project not found</h2>
          <Link to="/marketplace"><Button>Back to marketplace</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background">
      <Navbar /><AuthModal />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-fire mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden border border-border shadow-card">
              <img src={project.thumbnail_url || '/placeholder.svg'} alt={project.title} className="w-full aspect-video object-cover" />
            </motion.div>

            {project.screenshots?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.screenshots.map((ss: string, i: number) => (
                  <img key={i} src={ss} alt={`Screenshot ${i + 1}`} loading="lazy" className="rounded-xl aspect-video object-cover border border-border" />
                ))}
              </div>
            )}

            {project.video_url && (
              <div className="aspect-video rounded-2xl overflow-hidden border border-border">
                <iframe src={project.video_url} className="w-full h-full" allowFullScreen title="Project Video" />
              </div>
            )}

            <div>
              <h2 className="font-display text-xl font-bold mb-3 text-ink">About this project</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: project.full_desc || project.short_desc }} />
            </div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 sticky top-28 border border-border shadow-card">
              <h1 className="font-display text-2xl font-extrabold text-ink mb-2">{project.title}</h1>
              <p className="text-muted-foreground text-sm mb-5">{project.short_desc}</p>

              <div className="text-3xl font-display font-extrabold gradient-text mb-6">
                {isFree ? 'FREE' : `₹${project.price.toLocaleString('en-IN')}`}
              </div>

              <div className="space-y-3 mb-6">
                {project.preview_url && (
                  <Button variant="outline" className="w-full border-border" onClick={() => setPreviewUrl(project.preview_url)}>
                    <Eye className="h-4 w-4 mr-2" /> Live preview
                  </Button>
                )}
                {!user ? (
                  <Button className="w-full gradient-fire-strong text-white hover:opacity-95 glow-fire"
                    onClick={() => setShowAuthModal(true, isFree ? 'Sign in to download this free project.' : `Sign in to buy "${project.title}".`)}>
                    <Lock className="h-4 w-4 mr-2" /> Sign in to {isFree ? 'download' : 'buy'}
                  </Button>
                ) : purchased ? (
                  <Button onClick={handleDownload} disabled={downloading} className="w-full bg-green-600 text-white hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    {downloading ? 'Preparing…' : 'Download source code'}
                  </Button>
                ) : (
                  <Button className="w-full gradient-fire-strong text-white hover:opacity-95 glow-fire" onClick={handleBuy}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isFree ? 'Get free' : 'Buy now'}
                  </Button>
                )}
              </div>

              <div>
                <h3 className="font-display font-bold text-sm mb-2 text-ink">Tech stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack?.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="border-border text-muted-foreground">{tag}</Badge>
                  ))}
                </div>
              </div>

              {project.category?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-display font-bold text-sm mb-2 text-ink">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.category.map((cat: string) => (
                      <Badge key={cat} className="bg-fire/10 text-fire border-0">{cat}</Badge>
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
    </motion.div>
  );
}
