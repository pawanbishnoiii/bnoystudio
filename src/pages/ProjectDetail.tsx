import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, ShoppingCart, Download, Lock, ShieldCheck, Code2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { useRazorpay } from '@/hooks/useRazorpay';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import PreviewModal from '@/components/PreviewModal';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const techColors: Record<string, string> = {
  react: 'border-blue-400 text-blue-700',
  'next.js': 'border-black text-black',
  nextjs: 'border-black text-black',
  typescript: 'border-blue-600 text-blue-800',
  tailwind: 'border-cyan-400 text-cyan-700',
  supabase: 'border-emerald-500 text-emerald-700',
  postgres: 'border-indigo-500 text-indigo-700',
};
const techClass = (t: string) => techColors[t.toLowerCase().replace(/\s/g, '')] || techColors[t.toLowerCase()] || 'border-border text-muted-foreground';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user, setShowAuthModal } = useAuthStore();
  const { toast } = useToast();
  const { openPayment } = useRazorpay();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

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

  const { data: related } = useQuery({
    queryKey: ['related', project?.id],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*').eq('status', 'published').neq('id', project!.id).limit(3);
      return data || [];
    },
    enabled: !!project,
  });

  const isFree = project?.price === 0;
  const purchased = !!purchase;

  const images = project ? [project.thumbnail_url, ...(project.screenshots || [])].filter(Boolean) : [];

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
    openPayment({
      amount: project!.price,
      name: project!.title,
      description: `Purchase: ${project!.title}`,
      prefill: { email: user.email || '', name: user.user_metadata?.name || '' },
      onSuccess: async (paymentId) => {
        const { error } = await supabase.from('purchases').insert({
          user_id: user.id, project_id: project!.id, amount: project!.price, razorpay_payment_id: paymentId,
        });
        if (error) {
          toast({ title: 'Could not save purchase', description: error.message, variant: 'destructive' });
          return;
        }
        await refetchPurchase();
        toast({ title: 'Payment successful!', description: 'Download unlocked.' });
      },
      onFailure: () => toast({ title: 'Payment cancelled or failed', variant: 'destructive' }),
    });
  };

  const handleDownload = async () => {
    if (!project) return;
    setDownloading(true);
    try {
      if (project.source_code_url) {
        window.open(project.source_code_url, '_blank', 'noopener');
        return;
      }
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
        </div>
      </div>
    );
  }

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Navbar /><AuthModal />
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold mb-4">Project not found</h2>
        <Link to="/marketplace"><Button>Back to marketplace</Button></Link>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="min-h-screen bg-background">
      <Navbar /><AuthModal />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-fire mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ scale: 1.05, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}
              className="rounded-2xl overflow-hidden border border-border shadow-card">
              <motion.img key={activeImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                src={images[activeImg] || '/placeholder.svg'} alt={project.title} className="w-full aspect-video object-cover" />
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((src, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden border-2 transition ${activeImg === i ? 'border-fire' : 'border-border opacity-70 hover:opacity-100'}`}>
                    <img src={src!} alt="" className="w-full h-full object-cover" />
                  </button>
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

            <div>
              <h3 className="font-display font-bold text-sm mb-3 text-ink flex items-center gap-2"><Code2 className="h-4 w-4 text-fire" />Tech stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack?.map((tag: string) => (
                  <Badge key={tag} variant="outline" className={`bg-white ${techClass(tag)}`}>{tag}</Badge>
                ))}
              </div>
            </div>

            {project.category?.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-sm mb-3 text-ink">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {project.category.map((cat: string) => (
                    <Badge key={cat} className="bg-fire/10 text-fire border-0 hover:bg-fire/20">{cat}</Badge>
                  ))}
                </div>
              </div>
            )}

            {related && related.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-lg mb-4 text-ink">Related projects</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {related.slice(0, 3).map((p: any, i) => (
                    <ProjectCard key={p.id} project={p} index={i} onPreview={setPreviewUrl} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 sticky top-28 border border-border shadow-card">
              <h1 className="font-display text-[22px] font-extrabold text-ink mb-2 leading-tight">{project.title}</h1>
              <p className="text-muted-foreground text-sm mb-3">{project.short_desc}</p>

              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4 text-sun fill-sun" />)}
                <span className="text-xs text-muted-foreground ml-2">4.9 (200+ reviews)</span>
              </div>

              <div className={`text-3xl font-display font-extrabold mb-6 ${isFree ? 'text-green-600' : 'text-fire'}`}>
                {isFree ? 'FREE' : `₹${project.price.toLocaleString('en-IN')}`}
              </div>

              <div className="space-y-3 mb-6">
                {project.preview_url && (
                  <Button variant="outline" className="w-full border-border" onClick={() => setPreviewUrl(project.preview_url)}>
                    <Eye className="h-4 w-4 mr-2" /> Live preview
                  </Button>
                )}
                {!user ? (
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button className="w-full gradient-fire-strong text-white hover:opacity-95 glow-fire"
                      onClick={() => setShowAuthModal(true, isFree ? 'Sign in to download this free project.' : `Sign in to buy "${project.title}".`)}>
                      <Lock className="h-4 w-4 mr-2" /> Sign in to {isFree ? 'download' : 'buy'}
                    </Button>
                  </motion.div>
                ) : purchased ? (
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button onClick={handleDownload} disabled={downloading} className="w-full bg-green-600 text-white hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      {downloading ? 'Preparing…' : 'Download source code'}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button className="w-full gradient-fire-strong text-white hover:opacity-95 glow-fire" onClick={handleBuy}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isFree ? 'Get free' : 'Buy now'}
                    </Button>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-green-600" />Secure</span>
                <span className="inline-flex items-center gap-1">💳 Razorpay</span>
                <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5 text-fire" />Instant download</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">✨ 30-day support included</p>
            </motion.div>
          </div>
        </div>
      </div>
      <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      <Footer />
    </motion.div>
  );
}
