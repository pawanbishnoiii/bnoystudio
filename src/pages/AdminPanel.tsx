import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, PlusCircle, ShoppingCart, Users, BarChart3,
  Pencil, Trash2, IndianRupee, TrendingUp, Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: Package },
  { id: 'add', label: 'Add Project', icon: PlusCircle },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const COLORS = ['#FF5722', '#FFC107', '#E64A19', '#FFD54F', '#FF8A65'];

export default function AdminPanel() {
  const { user, isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar /><AuthModal />
      <div className="flex pt-20">
        <aside className="hidden md:flex w-64 flex-col warm-bg border-r border-border min-h-[calc(100vh-5rem)] p-4 fixed left-0 top-20">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === item.id
                    ? 'gradient-fire-strong text-white font-semibold shadow-card'
                    : 'text-muted-foreground hover:text-ink hover:bg-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border flex justify-around p-2">
          {sidebarItems.slice(0, 5).map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs ${activeTab === item.id ? 'text-fire' : 'text-muted-foreground'}`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 md:ml-64 p-6 pb-24 md:pb-6">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'projects' && <AdminProjects onEdit={() => setActiveTab('add')} />}
            {activeTab === 'add' && <AdminAddProject onDone={() => setActiveTab('projects')} />}
            {activeTab === 'orders' && <AdminOrders />}
            {activeTab === 'users' && <AdminUsers />}
            {activeTab === 'analytics' && <AdminAnalytics />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: projects } = useQuery({ queryKey: ['admin-projects'], queryFn: async () => { const { data } = await supabase.from('projects').select('*'); return data || []; } });
  const { data: purchases } = useQuery({ queryKey: ['admin-purchases'], queryFn: async () => { const { data } = await supabase.from('purchases').select('*, projects(title)'); return data || []; } });

  const totalRevenue = purchases?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
  const revenueData = purchases?.reduce((acc: any[], p: any) => {
    const date = new Date(p.created_at).toLocaleDateString();
    const existing = acc.find((x) => x.date === date);
    if (existing) existing.revenue += p.amount || 0;
    else acc.push({ date, revenue: p.amount || 0 });
    return acc;
  }, []) || [];

  const cards = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'from-primary to-accent' },
    { label: 'Total Sales', value: purchases?.length || 0, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Projects', value: projects?.length || 0, icon: Package, color: 'from-purple-500 to-pink-500' },
    { label: 'Published', value: projects?.filter((p: any) => p.status === 'published').length || 0, icon: Eye, color: 'from-cyan to-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Dashboard Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-border shadow-card p-5">
            <div className={`inline-flex w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} items-center justify-center mb-3`}>
              <c.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="text-2xl font-display font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      {revenueData.length > 0 && (
        <div className="bg-white rounded-xl border border-border shadow-card p-6">
          <h3 className="font-display font-semibold mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(24, 60%, 90%)" />
              <XAxis dataKey="date" stroke="hsl(240, 8%, 40%)" fontSize={12} />
              <YAxis stroke="hsl(240, 8%, 40%)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid hsl(24, 60%, 90%)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#FF5722" strokeWidth={2} dot={{ fill: '#FFC107' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="bg-white rounded-xl border border-border shadow-card p-6">
        <h3 className="font-display font-semibold mb-4">Recent Purchases</h3>
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="text-left p-3 text-sm">Project</th>
            <th className="text-left p-3 text-sm">Amount</th>
            <th className="text-left p-3 text-sm">Date</th>
          </tr></thead>
          <tbody>
            {purchases?.slice(0, 5).map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="p-3 text-sm">{p.projects?.title || 'Unknown'}</td>
                <td className="p-3 text-sm">{p.amount === 0 ? 'Free' : `₹${p.amount}`}</td>
                <td className="p-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!purchases || purchases.length === 0) && <p className="text-center text-muted-foreground py-4">No purchases yet</p>}
      </div>
    </div>
  );
}

function AdminProjects({ onEdit }: { onEdit: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const { data: projects } = useQuery({ queryKey: ['admin-projects'], queryFn: async () => { const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false }); return data || []; } });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('projects').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-projects'] }); toast({ title: 'Project deleted' }); },
  });

  const filtered = projects?.filter((p: any) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Manage Projects</h1>
        <Button onClick={onEdit} className="bg-gradient-to-r gradient-fire-strong text-white"><PlusCircle className="h-4 w-4 mr-2" />Add New</Button>
      </div>
      <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-warm-bg border-border max-w-sm" />
      <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="text-left p-4 text-sm">Title</th>
            <th className="text-left p-4 text-sm">Price</th>
            <th className="text-left p-4 text-sm">Status</th>
            <th className="text-left p-4 text-sm">Featured</th>
            <th className="text-right p-4 text-sm">Actions</th>
          </tr></thead>
          <tbody>
            {filtered?.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="p-4 text-sm font-semibold">{p.title}</td>
                <td className="p-4 text-sm">{p.price === 0 ? 'Free' : `₹${p.price}`}</td>
                <td className="p-4"><Badge variant={p.status === 'published' ? 'default' : 'outline'} className={p.status === 'published' ? 'bg-green-500/20 text-green-400 border-0' : ''}>{p.status}</Badge></td>
                <td className="p-4 text-sm">{p.featured ? '⭐' : '—'}</td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-border">
                      <AlertDialogHeader><AlertDialogTitle>Delete Project?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(p.id)} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!filtered || filtered.length === 0) && <p className="text-center text-muted-foreground py-8">No projects found</p>}
      </div>
    </div>
  );
}

function AdminAddProject({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '', short_desc: '', full_desc: '', price: 0, category: '',
    tech_stack: '', thumbnail_url: '', video_url: '', preview_url: '',
    source_code_url: '', featured: false, status: 'draft' as string,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('projects').insert({
        title: form.title,
        short_desc: form.short_desc,
        full_desc: form.full_desc,
        price: form.price,
        category: form.category.split(',').map((s) => s.trim()).filter(Boolean),
        tech_stack: form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
        thumbnail_url: form.thumbnail_url || null,
        video_url: form.video_url || null,
        preview_url: form.preview_url || null,
        source_code_url: form.source_code_url || null,
        featured: form.featured,
        status: form.status,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project created!' });
      onDone();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Add New Project</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border shadow-card p-6 space-y-5">
        <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="bg-warm-bg border-border" /></div>
        <div className="space-y-2"><Label>Short Description *</Label><Textarea value={form.short_desc} onChange={(e) => setForm({ ...form, short_desc: e.target.value })} required className="bg-warm-bg border-border" rows={2} /></div>
        <div className="space-y-2"><Label>Full Description (HTML)</Label><Textarea value={form.full_desc} onChange={(e) => setForm({ ...form, full_desc: e.target.value })} className="bg-warm-bg border-border" rows={6} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Price (₹) — 0 for Free</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="bg-warm-bg border-border" /></div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="bg-warm-bg border-border"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2"><Label>Categories (comma-separated)</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="React, Next.js, E-Commerce" className="bg-warm-bg border-border" /></div>
        <div className="space-y-2"><Label>Tech Stack (comma-separated)</Label><Input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, TypeScript, Tailwind" className="bg-warm-bg border-border" /></div>
        <div className="space-y-2"><Label>Thumbnail URL</Label><Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://..." className="bg-warm-bg border-border" /></div>
        <div className="space-y-2"><Label>Video URL</Label><Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="YouTube or MP4 URL" className="bg-warm-bg border-border" /></div>
        <div className="space-y-2"><Label>Live Preview URL</Label><Input value={form.preview_url} onChange={(e) => setForm({ ...form, preview_url: e.target.value })} placeholder="https://your-project.vercel.app" className="bg-warm-bg border-border" /></div>
        <div className="space-y-2"><Label>Source Code URL</Label><Input value={form.source_code_url} onChange={(e) => setForm({ ...form, source_code_url: e.target.value })} placeholder="ZIP file URL" className="bg-warm-bg border-border" /></div>
        <div className="flex items-center gap-3">
          <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
          <Label>Featured Project</Label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="bg-gradient-to-r gradient-fire-strong text-white">{loading ? 'Creating...' : 'Create Project'}</Button>
          <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

function AdminOrders() {
  const { data: purchases } = useQuery({ queryKey: ['admin-purchases'], queryFn: async () => { const { data } = await supabase.from('purchases').select('*, projects(title), profiles(email)'); return data || []; } });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Orders</h1>
      <div className="bg-white rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="text-left p-4 text-sm">User</th>
            <th className="text-left p-4 text-sm">Project</th>
            <th className="text-left p-4 text-sm">Amount</th>
            <th className="text-left p-4 text-sm">Payment ID</th>
            <th className="text-left p-4 text-sm">Date</th>
          </tr></thead>
          <tbody>
            {purchases?.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="p-4 text-sm">{p.profiles?.email || '—'}</td>
                <td className="p-4 text-sm">{p.projects?.title || '—'}</td>
                <td className="p-4 text-sm">{p.amount === 0 ? 'Free' : `₹${p.amount}`}</td>
                <td className="p-4 text-sm text-muted-foreground">{p.razorpay_payment_id || '—'}</td>
                <td className="p-4 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!purchases || purchases.length === 0) && <p className="text-center text-muted-foreground py-8">No orders yet</p>}
      </div>
    </div>
  );
}

function AdminUsers() {
  const { data: profiles } = useQuery({ queryKey: ['admin-profiles'], queryFn: async () => { const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); return data || []; } });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Users</h1>
      <div className="bg-white rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="text-left p-4 text-sm">Name</th>
            <th className="text-left p-4 text-sm">Email</th>
            <th className="text-left p-4 text-sm">Joined</th>
          </tr></thead>
          <tbody>
            {profiles?.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="p-4 text-sm">{p.name || '—'}</td>
                <td className="p-4 text-sm">{p.email}</td>
                <td className="p-4 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!profiles || profiles.length === 0) && <p className="text-center text-muted-foreground py-8">No users yet</p>}
      </div>
    </div>
  );
}

function AdminAnalytics() {
  const { data: purchases } = useQuery({ queryKey: ['admin-purchases'], queryFn: async () => { const { data } = await supabase.from('purchases').select('*, projects(title, category)'); return data || []; } });

  const topProjects = purchases?.reduce((acc: any, p: any) => {
    const title = p.projects?.title || 'Unknown';
    acc[title] = (acc[title] || 0) + 1;
    return acc;
  }, {});
  const topData = Object.entries(topProjects || {}).map(([name, count]) => ({ name, sales: count })).sort((a: any, b: any) => b.sales - a.sales).slice(0, 5);

  const categoryData = purchases?.reduce((acc: any, p: any) => {
    const cats = p.projects?.category || [];
    cats.forEach((c: string) => { acc[c] = (acc[c] || 0) + 1; });
    return acc;
  }, {});
  const pieData = Object.entries(categoryData || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Analytics</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-card p-6">
          <h3 className="font-display font-semibold mb-4">Top Selling Projects</h3>
          {topData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(24, 60%, 90%)" />
                <XAxis dataKey="name" stroke="hsl(240, 8%, 40%)" fontSize={11} />
                <YAxis stroke="hsl(240, 8%, 40%)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid hsl(24, 60%, 90%)', borderRadius: '8px' }} />
                <Bar dataKey="sales" fill="#FF5722" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-center py-12">No data yet</p>}
        </div>
        <div className="bg-white rounded-xl border border-border shadow-card p-6">
          <h3 className="font-display font-semibold mb-4">Sales by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'white', border: '1px solid hsl(24, 60%, 90%)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-center py-12">No data yet</p>}
        </div>
      </div>
    </div>
  );
}
