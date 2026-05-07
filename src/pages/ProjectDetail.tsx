import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, ShoppingCart, Download, Lock, ShieldCheck, Code2, Star, Heart, MessageCircle, Send, History, Mail, Link as LinkIcon, KeyRound, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { useRazorpay } from '@/hooks/useRazorpay';
import { techIcon } from '@/lib/techIcons';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import PreviewModal from '@/components/PreviewModal';
import Footer from '@/components/Footer';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function toEmbed(url: string): string {
  if (!url) return url;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

interface ChangelogEntry { version: string; date?: string; notes: string; }

export default function ProjectDetail() {
  const params = useParams();
  const idOrSlug = params.id || params.slug;
  const isUuid = !!idOrSlug && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const { user, isAdmin, setShowAuthModal } = useAuthStore();
  const { toast } = useToast();
  const { openPayment } = useRazorpay();
  const qc = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      const q = supabase.from('projects').select('*');
      const { data, error } = isUuid
        ? await q.eq('id', idOrSlug).single()
        : await q.eq('slug', idOrSlug).single();
      if (error) throw error;
      return data;
    },
    enabled: !!idOrSlug,
  });
  const id = project?.id;

  // Track view once
  useEffect(() => {
    if (id) supabase.rpc('increment_project_views', { _project_id: id });
  }, [id]);

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

  const { data: likeData } = useQuery({
    queryKey: ['project-like', id, user?.id],
    queryFn: async () => {
      if (!user) return { liked: false };
      const { data } = await supabase.from('project_likes').select('id').eq('project_id', id!).eq('user_id', user.id).maybeSingle();
      return { liked: !!data };
    },
    enabled: !!id,
  });

  const { data: comments } = useQuery({
    queryKey: ['project-comments', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('project_comments')
        .select('*, profiles(name, avatar_url, email)')
        .eq('project_id', id!)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const isFree = project?.price === 0;
  const purchased = !!purchase;

  // Changelog handling — supports JSON array, also injects current version if missing
  const changelog: ChangelogEntry[] = (() => {
    const raw = (project as any)?.changelog;
    let arr: ChangelogEntry[] = [];
    if (Array.isArray(raw)) arr = raw;
    else if (typeof raw === 'string' && raw.trim()) {
      try { arr = JSON.parse(raw); } catch { arr = [{ version: project?.version || 'v1.0', notes: raw }]; }
    }
    if (project?.version && !arr.find(e => e.version === project.version)) {
      arr = [{ version: project.version, date: new Date(project.created_at).toISOString().slice(0,10), notes: 'Initial release.' }, ...arr];
    }
    return arr;
  })();

  useEffect(() => {
    if (changelog.length && !selectedVersion) setSelectedVersion(changelog[0].version);
  }, [changelog.length]);

  const activeChange = changelog.find(c => c.version === selectedVersion) || changelog[0];

  // If a changelog entry contains its own screenshots, those override the project-wide ones for that version.
  const versionScreenshots = (activeChange as any)?.screenshots as string[] | undefined;
  const baseImages = project ? [project.thumbnail_url, ...(project.screenshots || [])].filter(Boolean) : [];
  const images = versionScreenshots && versionScreenshots.length > 0
    ? [project?.thumbnail_url, ...versionScreenshots].filter(Boolean) as string[]
    : baseImages;

  // Reset active image whenever the gallery source changes
  useEffect(() => { setActiveImg(0); }, [selectedVersion]);

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

  const toggleLike = async () => {
    if (!user) { setShowAuthModal(true, 'Sign in to like this project.'); return; }
    if (likeData?.liked) {
      await supabase.from('project_likes').delete().eq('project_id', id!).eq('user_id', user.id);
    } else {
      await supabase.from('project_likes').insert({ project_id: id!, user_id: user.id });
    }
    qc.invalidateQueries({ queryKey: ['project-like', id, user.id] });
    qc.invalidateQueries({ queryKey: ['project', id] });
  };

  const submitComment = async () => {
    if (!user) { setShowAuthModal(true, 'Sign in to leave a review.'); return; }
    if (!commentText.trim()) return;
    const { error } = await supabase.from('project_comments').insert({
      project_id: id!, user_id: user.id, content: commentText.trim(), rating,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setCommentText('');
    qc.invalidateQueries({ queryKey: ['project-comments', id] });
    toast({ title: 'Review posted ✨' });
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

  const avgRating = comments?.length
    ? (comments.filter(c => c.rating).reduce((s, c: any) => s + (c.rating || 0), 0) / Math.max(1, comments.filter(c => c.rating).length))
    : 4.9;

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
              <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-black">
                <iframe src={toEmbed(project.video_url)} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Project Video" />
              </div>
            )}

            <div>
              <h2 className="font-display text-xl font-bold mb-3 text-ink">About this project</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: project.full_desc || project.short_desc }} />
            </div>

            <div>
              <h3 className="font-display font-bold text-sm mb-3 text-ink flex items-center gap-2"><Code2 className="h-4 w-4 text-fire" />Tech stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack?.map((tag: string) => {
                  const icon = techIcon(tag);
                  return (
                    <div key={tag} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white shadow-sm text-sm">
                      {icon && <img src={icon} alt={tag} className="w-4 h-4" loading="lazy" onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />}
                      <span className="font-semibold text-ink">{tag}</span>
                    </div>
                  );
                })}
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

            {/* Changelog */}
            {changelog.length > 0 && (
              <div className="rounded-2xl border border-border bg-white shadow-card p-6">
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                  <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                    <History className="h-4 w-4 text-fire" /> Changelog
                  </h3>
                  <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                    <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {changelog.map(c => <SelectItem key={c.version} value={c.version}>{c.version}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(!user || !purchased) ? (
                  <div className="text-sm text-muted-foreground bg-warm-bg/60 rounded-lg p-4 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-fire" /> Sign in &amp; purchase to view full version history.
                  </div>
                ) : activeChange ? (
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Badge variant="outline" className="border-fire/30 text-fire bg-fire/5">{activeChange.version}</Badge>
                      {activeChange.date && <span>· {activeChange.date}</span>}
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-ink/80 font-sans leading-relaxed">{activeChange.notes}</pre>
                  </div>
                ) : null}
              </div>
            )}

            {/* Reviews & Comments */}
            <div className="rounded-2xl border border-border bg-white shadow-card p-6">
              <h3 className="font-display font-bold text-base text-ink flex items-center gap-2 mb-4">
                <MessageCircle className="h-4 w-4 text-fire" /> Reviews ({comments?.length || 0})
              </h3>

              {user ? (
                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <button key={i} onClick={() => setRating(i)} aria-label={`${i} star`}>
                        <Star className={`h-5 w-5 ${i <= rating ? 'text-sun fill-sun' : 'text-border'}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Share what you think…" className="bg-warm-bg border-border" rows={3} />
                  <Button onClick={submitComment} className="gradient-fire-strong text-white">
                    <Send className="h-4 w-4 mr-2" /> Post review
                  </Button>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true, 'Sign in to leave a review.')} className="w-full text-sm text-muted-foreground bg-warm-bg/60 rounded-lg p-3 hover:bg-warm-bg transition">
                  Sign in to leave a review
                </button>
              )}

              <div className="space-y-4">
                {(comments || []).map((c: any) => (
                  <div key={c.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={c.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user_id}`}
                        alt="" className="w-9 h-9 rounded-full border border-border bg-warm-bg"
                      />
                      <div>
                        <p className="text-sm font-semibold text-ink">{c.profiles?.name || c.profiles?.email?.split('@')[0] || 'User'}</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i <= (c.rating || 0) ? 'text-sun fill-sun' : 'text-border'}`} />)}
                          <span className="text-[11px] text-muted-foreground ml-1">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-ink/80 leading-relaxed">{c.content}</p>
                  </div>
                ))}
                {(!comments || comments.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Be the first to review this project.</p>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 sticky top-28 border border-border shadow-card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="font-display text-[22px] font-extrabold text-ink leading-tight">{project.title}</h1>
                {project.version && (
                  <Badge variant="outline" className="border-fire/30 text-fire bg-fire/5 shrink-0">{project.version}</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-3">{project.short_desc}</p>

              <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {[1,2,3,4,5].map((i) => <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(avgRating) ? 'text-sun fill-sun' : 'text-border'}`} />)}
                  <span className="ml-1 font-semibold text-ink">{avgRating.toFixed(1)}</span>
                </span>
                <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{(project as any).views_count || 0}</span>
                <button onClick={toggleLike} className="inline-flex items-center gap-1 hover:text-fire transition">
                  <Heart className={`h-3.5 w-3.5 ${likeData?.liked ? 'fill-fire text-fire' : ''}`} />
                  {(project as any).likes_count || 0}
                </button>
              </div>

              {purchased && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> You own this project
                </div>
              )}

              <div className={`text-3xl font-display font-extrabold mb-6 ${isFree ? 'text-green-600' : 'text-fire'}`}>
                {isFree ? 'FREE' : `₹${project.price.toLocaleString('en-IN')}`}
                {project.discount_price && project.discount_price < project.price && (
                  <span className="text-sm text-muted-foreground line-through ml-2">₹{project.price.toLocaleString('en-IN')}</span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {project.preview_url && ((project as any).preview_enabled !== false || isAdmin) && (
                  <Button variant="outline" className="w-full border-border" onClick={() => setPreviewUrl(project.preview_url)}>
                    <Eye className="h-4 w-4 mr-2" /> Live preview {(project as any).preview_enabled === false && <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-600">(admin)</span>}
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

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-green-600" />Secure</span>
                <span className="inline-flex items-center gap-1">💳 Razorpay</span>
                <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5 text-fire" />Instant download</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">✨ 30-day support included</p>
            </motion.div>

            {isAdmin && ((project as any).lov_email || (project as any).project_url) && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-3">Admin only · internal links</p>
                <div className="space-y-2">
                  {(project as any).lov_email && (
                    <a href={`mailto:${(project as any).lov_email}`} className="flex items-center gap-2 text-sm text-ink hover:text-fire break-all">
                      <Mail className="h-4 w-4 text-fire shrink-0" /> {(project as any).lov_email}
                    </a>
                  )}
                  {(project as any).project_url && (
                    <a href={(project as any).project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-ink hover:text-fire break-all">
                      <LinkIcon className="h-4 w-4 text-fire shrink-0" /> {(project as any).project_url}
                    </a>
                  )}
                </div>
              </div>
            )}

            {related && related.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-border shadow-card">
                <h3 className="font-display font-bold text-base mb-3 text-ink">You might also like</h3>
                <div className="space-y-3">
                  {related.slice(0, 3).map((p: any) => (
                    <Link key={p.id} to={`/project/${p.id}`} className="flex gap-3 group hover:bg-orange-50/50 rounded-lg p-2 -m-2 transition">
                      <img src={p.thumbnail_url || '/placeholder.svg'} alt={p.title} className="w-20 h-14 rounded-md object-cover border border-border shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-ink truncate group-hover:text-fire">{p.title}</p>
                        <p className="text-xs text-fire font-bold mt-1">{p.price === 0 ? 'FREE' : `₹${p.price.toLocaleString('en-IN')}`}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      <Footer />
    </motion.div>
  );
}
