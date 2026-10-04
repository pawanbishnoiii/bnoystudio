import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClayIcon } from '@/components/ui/clay-icon';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import authStudio from '@/assets/generated/auth-studio.webp';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<'login' | 'signup'>(location.pathname === '/login' ? 'login' : 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast({ title: 'Account created ✨', description: 'Check your email to confirm and finish signing in.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: 'Welcome back!' });
        navigate('/');
      }
    } catch (err: unknown) {
      toast({ title: 'Auth error', description: err instanceof Error ? err.message : 'Something went wrong.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const oauth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) {
      toast({ title: 'Sign-in failed', description: String(r.error.message || r.error), variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <main className="studio-dark noise-overlay relative min-h-dvh overflow-hidden p-3 text-white sm:p-6 lg:p-8">
      <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-fire/15 blur-[100px]" />
      <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-aqua/10 blur-[110px]" />
      <Link to="/" className="absolute left-6 top-6 z-30 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/65 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Back to studio</Link>

      <motion.div initial={{ opacity: 0, y: 24, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[30px] border border-white/10 bg-white/[.055] shadow-[0_50px_140px_-50px_rgba(0,0,0,.9)] backdrop-blur-2xl sm:min-h-[calc(100dvh-3rem)] lg:grid-cols-[.88fr_1.12fr]">
        <section className="relative z-10 flex flex-col bg-[#f7f3ed] p-7 text-ink sm:p-10 lg:p-14">
          <Link to="/" className="inline-flex items-center gap-2 self-start font-display text-lg font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">B</span>BNOY<span className="text-fire">/STUDIO</span></Link>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
            <AnimatePresence mode="wait">
              <motion.header key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-8">
                <span className="studio-kicker text-fire"><Sparkles className="h-3 w-3" /> Private workspace</span>
                <h1 className="mt-5 font-display text-4xl font-extrabold leading-[.98] tracking-[-.045em] sm:text-5xl">{mode === 'signup' ? 'Make your next move.' : 'Welcome back, builder.'}</h1>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{mode === 'signup' ? 'Create your account and start with a production-ready foundation.' : 'Sign in to continue your projects, purchases and launches.'}</p>
              </motion.header>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence initial={false}>{mode === 'signup' && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><Field label="Full name"><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="auth-input" /></Field></motion.div>}</AnimatePresence>
              <Field label="Email address"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" className="auth-input" /></Field>
              <Field label="Password"><input type={showPwd ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" className="auth-input" /><button type="button" onClick={() => setShowPwd((s) => !s)} className="text-ink/35 transition hover:text-ink" aria-label={showPwd ? 'Hide password' : 'Show password'}>{showPwd ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button></Field>
              <Button type="submit" disabled={loading} className="group h-[52px] w-full rounded-full bg-ink text-white shadow-[0_18px_34px_-18px_rgba(7,11,20,.65)] hover:bg-ink/90">{loading ? 'One moment…' : mode === 'signup' ? 'Create my workspace' : 'Enter workspace'}<ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Button>
              <div className="grid grid-cols-2 gap-3 pt-1"><SocialButton onClick={() => oauth('apple')} disabled={loading}><AppleGlyph /> Apple</SocialButton><SocialButton onClick={() => oauth('google')} disabled={loading}><GoogleGlyph /> Google</SocialButton></div>
            </form>

            <div className="mt-8 flex items-center justify-between gap-4 text-xs text-muted-foreground"><span>{mode === 'signup' ? 'Already a member?' : 'New to Bnoy?'} <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="font-bold text-ink underline decoration-fire/50 underline-offset-4">{mode === 'signup' ? 'Sign in' : 'Create account'}</button></span><Link to="/refund" className="hover:text-ink">Terms</Link></div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[.24em] text-ink/30">Secure by design · yours by default</p>
        </section>

        <section className="relative hidden overflow-hidden lg:block">
          <img src={authStudio} alt="Creative team shaping a digital product in a studio" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/90 via-[#070b14]/5 to-[#070b14]/15" />
          <div className="absolute inset-x-10 bottom-10 grid grid-cols-[1fr_auto] items-end gap-6 xl:inset-x-14 xl:bottom-14">
            <div className="max-w-xl"><span className="studio-kicker border-white/20 bg-white/10 text-aqua backdrop-blur-xl">Inside the studio</span><blockquote className="mt-5 font-display text-3xl font-bold leading-tight tracking-[-.035em] xl:text-4xl">“The best products feel inevitable. The work behind them never is.”</blockquote><p className="mt-4 text-sm text-white/55">A focused space for shipping ambitious digital work.</p></div>
            <div className="rounded-[26px] border border-white/15 bg-[#0a1020]/70 p-4 backdrop-blur-2xl"><ClayIcon name="team" className="h-24 w-24" /><div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/60"><span className="h-2 w-2 rounded-full bg-aqua shadow-[0_0_14px_#78f3c6]" /> Community online</div></div>
          </div>
        </section>
      </motion.div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[.2em] text-ink/40">{label}</span><span className="flex h-[52px] items-center gap-2 rounded-2xl border border-ink/10 bg-white/70 px-4 shadow-[inset_0_1px_0_white] transition focus-within:border-fire/60 focus-within:ring-4 focus-within:ring-fire/10">{children}</span></label>; }
function SocialButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button type="button" className="flex h-12 items-center justify-center gap-2 rounded-full border border-ink/10 bg-white/60 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white" {...props}>{children}</button>; }
function GoogleGlyph() { return <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.3 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 16.4 4.5 9.9 8.8 6.3 14.1z"/><path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13.1-5.1l-6-5c-2 1.4-4.5 2.1-7.1 2.1-5.3 0-9.7-3.5-11.3-8.4l-6.5 5C9.7 38.9 16.3 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.4l6 5c-.4.4 6.3-4.6 6.3-14.4 0-1.2-.1-2.3-.4-3.5z"/></svg>; }
function AppleGlyph() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16.365 1.43c0 1.14-.46 2.232-1.21 3.026-.79.852-2.04 1.515-3.118 1.43-.13-1.082.41-2.232 1.16-3.026.79-.853 2.13-1.515 3.168-1.43zM20.5 17.31c-.55 1.27-.81 1.84-1.52 2.96-.99 1.55-2.39 3.49-4.12 3.5-1.54 0-1.94-.99-4.04-.98-2.1.01-2.55.99-4.09.97-1.73-.01-3.05-1.76-4.04-3.31C.94 17.5.31 13.6 1.96 10.95c1.17-1.88 3.02-2.99 4.76-2.99 1.77 0 2.88 1.01 4.34 1.01 1.41 0 2.27-1.01 4.32-1.01 1.55 0 3.19.84 4.36 2.3-3.83 2.1-3.21 7.56.76 9.05z"/></svg>; }
