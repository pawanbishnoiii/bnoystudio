import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, Settings2, Heart, Download, Sparkles, IndianRupee, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  if (!user) return <Navigate to="/" replace />;

  const { data: profile } = useQuery({
    queryKey: ['profile', user.id],
    queryFn: async () => (await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()).data,
  });

  const { data: purchases } = useQuery({
    queryKey: ['my-purchases', user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('purchases').select('*, projects(*)').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: wishlist } = useQuery({
    queryKey: ['my-wishlist', user.id],
    queryFn: async () => (await supabase.from('wishlists').select('*, projects(*)').eq('user_id', user.id)).data,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', user.id, purchases?.length],
    queryFn: async () => {
      const purchasedIds = (purchases || []).map((p: any) => p.project_id);
      let q = supabase.from('projects').select('*').eq('status', 'published').order('featured', { ascending: false }).order('created_at', { ascending: false }).limit(6);
      if (purchasedIds.length) q = q.not('id', 'in', `(${purchasedIds.join(',')})`);
      return (await q).data || [];
    },
    enabled: !!purchases,
  });

  const removeWishMut = useMutation({
    mutationFn: async (id: string) => { await supabase.from('wishlists').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-wishlist'] }),
  });

  const totalSpent = purchases?.reduce((s: number, p: any) => s + (p.amount || 0), 0) || 0;
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
  const initials = (profile?.name || user.email || 'U').split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const path = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('project-assets').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('project-assets').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: pub.publicUrl }).eq('id', user.id);
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Avatar updated!' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const handleDownload = async (project: any) => {
    if (project?.source_code_url) { window.open(project.source_code_url, '_blank', 'noopener'); return; }
    try {
      const path = `${project.id}/source.zip`;
      const { data, error } = await supabase.storage.from('source-code').createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank', 'noopener');
    } catch (e: any) {
      toast({ title: 'Download unavailable', description: e.message || 'Source not yet uploaded.', variant: 'destructive' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="min-h-screen bg-background">
      <Navbar /><AuthModal />
      <div className="container mx-auto px-4 pt-28 pb-20">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-white rounded-2xl border border-border shadow-card p-6 mb-8 flex flex-col md:flex-row md:items-center gap-6">
          <Avatar className="h-20 w-20 ring-4 ring-fire/30">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="gradient-fire-strong text-white font-bold text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-extrabold text-ink">{profile?.name || user.email?.split('@')[0]}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Member since {memberSince}</p>
          </div>
          <div className="flex gap-2">
            <MiniStat label="Purchases" value={purchases?.length || 0} />
            <MiniStat label="Spent" value={`₹${totalSpent.toLocaleString('en-IN')}`} />
            <MiniStat label="Wishlist" value={wishlist?.length || 0} />
          </div>
        </motion.div>

        <Tabs defaultValue="purchases" className="space-y-6">
          <TabsList className="bg-warm-bg border border-border flex flex-wrap h-auto">
            <TabsTrigger value="purchases"><Download className="h-5 w-5 mr-2" />Purchases</TabsTrigger>
            <TabsTrigger value="payments"><CreditCard className="h-5 w-5 mr-2" />Payments</TabsTrigger>
            <TabsTrigger value="wishlist"><Heart className="h-5 w-5 mr-2" />Wishlist</TabsTrigger>
            <TabsTrigger value="recommendations"><Sparkles className="h-5 w-5 mr-2" />For you</TabsTrigger>
            <TabsTrigger value="settings"><Settings2 className="h-5 w-5 mr-2" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            <div className="space-y-3">
              {(!purchases || purchases.length === 0) && <EmptyState text="No purchases yet." cta="Browse marketplace" link="/marketplace" />}
              {purchases?.map((p: any) => (
                <div key={p.id} className="bg-white rounded-xl p-4 border border-border shadow-card flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={p.projects?.thumbnail_url || '/placeholder.svg'} alt="" className="w-20 h-14 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-ink truncate">{p.projects?.title}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()} · {p.amount === 0 ? 'Free' : `₹${p.amount}`}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleDownload(p.projects)} className="bg-green-600 text-white hover:bg-green-700">
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="bg-white rounded-xl overflow-x-auto border border-border shadow-card">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-warm-bg">
                  <th className="text-left p-4">Date</th><th className="text-left p-4">Project</th>
                  <th className="text-left p-4">Amount</th><th className="text-left p-4">Status</th>
                </tr></thead>
                <tbody>
                  {purchases?.map((p: any, idx: number) => (
                    <tr key={p.id} className={idx % 2 ? 'bg-warm-bg/40' : ''}>
                      <td className="p-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-ink">{p.projects?.title}</td>
                      <td className="p-4 text-fire font-bold">{p.amount === 0 ? 'Free' : `₹${p.amount}`}</td>
                      <td className="p-4"><span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Success</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!purchases || purchases.length === 0) && <EmptyState text="No payment history yet." cta="Browse marketplace" link="/marketplace" />}
            </div>
          </TabsContent>

          <TabsContent value="wishlist">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist?.map((w: any) => (
                <div key={w.id} className="relative">
                  <ProjectCard project={w.projects} />
                  <button onClick={() => removeWishMut.mutate(w.id)}
                    className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-destructive hover:bg-white">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(!wishlist || wishlist.length === 0) && <div className="col-span-full"><EmptyState text="Your wishlist is empty." cta="Discover projects" link="/marketplace" /></div>}
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <h2 className="font-display text-xl font-bold text-ink mb-4">Recommended for you</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations?.map((p: any, i) => (
                <div key={p.id} className="relative">
                  <span className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full bg-fire text-white text-[10px] font-bold uppercase">Recommended</span>
                  <ProjectCard project={p} index={i} />
                </div>
              ))}
              {(!recommendations || recommendations.length === 0) && <p className="col-span-full text-center py-8 text-muted-foreground">No recommendations yet.</p>}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <StatCard icon={ShoppingBag} label="Total Purchases" value={purchases?.length || 0} />
              <StatCard icon={IndianRupee} label="Total Spent" value={`₹${totalSpent.toLocaleString('en-IN')}`} />
              <StatCard icon={Sparkles} label="Member Since" value={memberSince} />
            </div>
            <div className="bg-white rounded-xl p-6 max-w-lg space-y-5 border border-border shadow-card">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-fire/40">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="gradient-fire-strong text-white font-bold">{initials}</AvatarFallback>
                </Avatar>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                  <span className="text-sm text-fire hover:underline font-medium">{uploading ? 'Uploading…' : 'Change picture'}</span>
                </label>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input value={user.email || ''} disabled /></div>
              <div className="space-y-2"><Label>Name</Label><Input placeholder="Your name" defaultValue={profile?.name || ''} /></div>
              <Button className="gradient-fire-strong text-white">Save changes</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </motion.div>
  );
}

function MiniStat({ label, value }: { label: string; value: any }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-white border border-border text-center min-w-[80px]">
      <div className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</div>
      <div className="font-display font-bold text-ink text-sm">{value}</div>
    </div>
  );
}
function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-white border border-border rounded-xl p-5 shadow-card">
      <div className="w-10 h-10 rounded-lg gradient-fire-strong text-white flex items-center justify-center mb-3"><Icon className="h-5 w-5" /></div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
function EmptyState({ text, cta, link }: { text: string; cta: string; link: string }) {
  return (
    <div className="text-center py-12">
      <svg width="120" height="120" viewBox="0 0 200 200" className="mx-auto opacity-60">
        <rect x="40" y="60" width="120" height="100" rx="12" fill="#FFE0B2" />
        <rect x="55" y="80" width="90" height="8" rx="4" fill="#FFB74D" />
        <rect x="55" y="100" width="60" height="8" rx="4" fill="#FFB74D" />
        <circle cx="100" cy="50" r="14" fill="#FF5722" />
      </svg>
      <p className="text-muted-foreground mb-4 mt-2">{text}</p>
      <Link to={link}><Button className="gradient-fire-strong text-white">{cta}</Button></Link>
    </div>
  );
}
