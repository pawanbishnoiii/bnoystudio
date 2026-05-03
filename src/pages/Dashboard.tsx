import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, Settings, Heart, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  if (!user) return <Navigate to="/" replace />;

  const { data: purchases } = useQuery({
    queryKey: ['my-purchases', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, projects(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: wishlist } = useQuery({
    queryKey: ['my-wishlist', user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('wishlists').select('*, projects(*)').eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
  });

  const handleDownload = async (project: any) => {
    if (project?.source_code_url) {
      window.open(project.source_code_url, '_blank', 'noopener');
      return;
    }
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background">
      <Navbar /><AuthModal />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink">My dashboard</h1>
        <p className="text-muted-foreground mt-1 mb-8">Manage your purchases and account settings.</p>

        <Tabs defaultValue="purchases" className="space-y-6">
          <TabsList className="bg-warm-bg border border-border">
            <TabsTrigger value="purchases"><ShoppingBag className="h-4 w-4 mr-2" />Purchases</TabsTrigger>
            <TabsTrigger value="payments"><CreditCard className="h-4 w-4 mr-2" />Payments</TabsTrigger>
            <TabsTrigger value="wishlist"><Heart className="h-4 w-4 mr-2" />Wishlist</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            <div className="space-y-3">
              {(!purchases || purchases.length === 0) && <p className="text-muted-foreground py-8 text-center">No purchases yet. Browse the marketplace!</p>}
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
            <div className="bg-white rounded-xl overflow-hidden border border-border shadow-card">
              <table className="w-full">
                <thead><tr className="border-b border-border bg-warm-bg">
                  <th className="text-left p-4 text-sm">Date</th>
                  <th className="text-left p-4 text-sm">Project</th>
                  <th className="text-left p-4 text-sm">Amount</th>
                  <th className="text-left p-4 text-sm">Payment ID</th>
                  <th className="text-left p-4 text-sm">Status</th>
                </tr></thead>
                <tbody>
                  {purchases?.map((p: any) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="p-4 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-sm text-ink">{p.projects?.title}</td>
                      <td className="p-4 text-sm">{p.amount === 0 ? 'Free' : `₹${p.amount}`}</td>
                      <td className="p-4 text-xs text-muted-foreground">{p.razorpay_payment_id || '—'}</td>
                      <td className="p-4"><span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Completed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!purchases || purchases.length === 0) && <p className="text-center text-muted-foreground py-8">No payment history</p>}
            </div>
          </TabsContent>

          <TabsContent value="wishlist">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist?.map((w: any) => (
                <div key={w.id} className="bg-white rounded-xl p-4 border border-border shadow-card">
                  <img src={w.projects?.thumbnail_url || '/placeholder.svg'} alt="" className="w-full aspect-video object-cover rounded-lg mb-3" />
                  <h3 className="font-display font-bold text-ink">{w.projects?.title}</h3>
                  <p className="text-sm text-fire font-semibold mt-1">{w.projects?.price === 0 ? 'FREE' : `₹${w.projects?.price}`}</p>
                </div>
              ))}
              {(!wishlist || wishlist.length === 0) && <p className="text-muted-foreground col-span-full text-center py-8">No items in wishlist</p>}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white rounded-xl p-6 max-w-lg space-y-5 border border-border shadow-card">
              <div className="space-y-2"><Label>Email</Label><Input value={user.email || ''} disabled /></div>
              <div className="space-y-2"><Label>Name</Label><Input placeholder="Your name" defaultValue={(user.user_metadata as any)?.name || ''} /></div>
              <Button className="gradient-fire-strong text-white">Save changes</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </motion.div>
  );
}
