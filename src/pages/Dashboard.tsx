import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, Settings, Heart, Download, ExternalLink } from 'lucide-react';
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
      const { data, error } = await supabase
        .from('wishlists')
        .select('*, projects(*)')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar /><AuthModal />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground mb-8">Manage your purchases and account settings</p>

          <Tabs defaultValue="purchases" className="space-y-6">
            <TabsList className="glass border border-border">
              <TabsTrigger value="purchases"><ShoppingBag className="h-4 w-4 mr-2" />Purchases</TabsTrigger>
              <TabsTrigger value="payments"><CreditCard className="h-4 w-4 mr-2" />Payments</TabsTrigger>
              <TabsTrigger value="wishlist"><Heart className="h-4 w-4 mr-2" />Wishlist</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="purchases">
              <div className="space-y-4">
                {purchases?.length === 0 && <p className="text-muted-foreground py-8 text-center">No purchases yet. Browse the marketplace!</p>}
                {purchases?.map((p: any) => (
                  <div key={p.id} className="glass rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={p.projects?.thumbnail_url || '/placeholder.svg'} alt={p.projects?.title} className="w-16 h-12 rounded-lg object-cover" />
                      <div>
                        <h3 className="font-display font-semibold">{p.projects?.title}</h3>
                        <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 text-primary-foreground">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="glass rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-display">Date</th>
                    <th className="text-left p-4 text-sm font-display">Project</th>
                    <th className="text-left p-4 text-sm font-display">Amount</th>
                    <th className="text-left p-4 text-sm font-display">Status</th>
                  </tr></thead>
                  <tbody>
                    {purchases?.map((p: any) => (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="p-4 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-sm">{p.projects?.title}</td>
                        <td className="p-4 text-sm">{p.amount === 0 ? 'Free' : `₹${p.amount}`}</td>
                        <td className="p-4"><span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Completed</span></td>
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
                  <div key={w.id} className="glass rounded-xl p-4">
                    <img src={w.projects?.thumbnail_url || '/placeholder.svg'} alt="" className="w-full aspect-video object-cover rounded-lg mb-3" />
                    <h3 className="font-display font-semibold">{w.projects?.title}</h3>
                    <p className="text-sm text-primary font-semibold mt-1">{w.projects?.price === 0 ? 'FREE' : `₹${w.projects?.price}`}</p>
                  </div>
                ))}
                {(!wishlist || wishlist.length === 0) && <p className="text-muted-foreground col-span-full text-center py-8">No items in wishlist</p>}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="glass rounded-xl p-6 max-w-lg space-y-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Your name" className="bg-secondary border-border" />
                </div>
                <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">Save Changes</Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
