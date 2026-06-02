import { useEffect, useState } from 'react';
import { Search, BarChart3, ShieldCheck, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const KEYS = {
  gsc: 'bnoy_gsc_verification',
  ga: 'bnoy_ga4_id',
  gtm: 'bnoy_gtm_id',
};

/** Admin Google integrations: GSC verification meta + GA4 + GTM injection. */
export default function AdminGoogle() {
  const [gsc, setGsc] = useState('');
  const [ga, setGa] = useState('');
  const [gtm, setGtm] = useState('');

  useEffect(() => {
    setGsc(localStorage.getItem(KEYS.gsc) || '');
    setGa(localStorage.getItem(KEYS.ga) || '');
    setGtm(localStorage.getItem(KEYS.gtm) || '');
  }, []);

  const save = () => {
    localStorage.setItem(KEYS.gsc, gsc.trim());
    localStorage.setItem(KEYS.ga, ga.trim());
    localStorage.setItem(KEYS.gtm, gtm.trim());
    injectGoogle();
    toast.success('Google integrations saved', { description: 'Tracking is live across all pages.' });
  };

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast('Copied to clipboard'); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Search className="h-6 w-6 text-fire" /> Google Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Verify Search Console, plug in GA4 / GTM. Changes apply instantly.</p>
      </div>

      <Card title="Search Console verification" icon={<ShieldCheck className="h-5 w-5 text-fire" />}>
        <Label className="text-xs uppercase tracking-widest font-bold">Verification code (content value)</Label>
        <Input value={gsc} onChange={(e) => setGsc(e.target.value)} placeholder="abc123…  or full <meta> tag" />
        <p className="text-xs text-muted-foreground">Paste either just the content value, or the entire <code>&lt;meta&gt;</code> tag — we'll extract it.</p>
        <a className="inline-flex items-center gap-1 text-xs font-semibold text-fire hover:underline" target="_blank" rel="noreferrer" href="https://search.google.com/search-console/welcome">
          Open Search Console <ExternalLink className="h-3 w-3" />
        </a>
      </Card>

      <Card title="Google Analytics 4" icon={<BarChart3 className="h-5 w-5 text-fire" />}>
        <Label className="text-xs uppercase tracking-widest font-bold">GA4 Measurement ID</Label>
        <Input value={ga} onChange={(e) => setGa(e.target.value)} placeholder="G-XXXXXXX" />
      </Card>

      <Card title="Google Tag Manager" icon={<BarChart3 className="h-5 w-5 text-fire" />}>
        <Label className="text-xs uppercase tracking-widest font-bold">GTM Container ID</Label>
        <Input value={gtm} onChange={(e) => setGtm(e.target.value)} placeholder="GTM-XXXXXXX" />
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} className="gradient-fire-strong text-white">Save & activate</Button>
        {gsc && <Button variant="outline" onClick={() => copy(`<meta name="google-site-verification" content="${extractGsc(gsc)}" />`)}><Copy className="h-4 w-4 mr-1" /> Copy meta tag</Button>}
      </div>
    </div>
  );
}

function Card({ title, icon, children }: any) {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-3">
      <h3 className="font-display font-bold flex items-center gap-2">{icon} {title}</h3>
      {children}
    </div>
  );
}

function extractGsc(raw: string) {
  const m = raw.match(/content=["']([^"']+)["']/);
  return m ? m[1] : raw.trim();
}

/** Injects GSC meta + GA4 + GTM into <head> from localStorage. Called on app boot + after save. */
export function injectGoogle() {
  if (typeof document === 'undefined') return;
  const gsc = extractGsc(localStorage.getItem(KEYS.gsc) || '');
  const ga = (localStorage.getItem(KEYS.ga) || '').trim();
  const gtm = (localStorage.getItem(KEYS.gtm) || '').trim();

  document.querySelectorAll('[data-bnoy-google]').forEach((n) => n.remove());

  if (gsc) {
    const m = document.createElement('meta');
    m.name = 'google-site-verification';
    m.content = gsc;
    m.setAttribute('data-bnoy-google', '1');
    document.head.appendChild(m);
  }
  if (ga) {
    const s = document.createElement('script');
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    s.async = true;
    s.setAttribute('data-bnoy-google', '1');
    document.head.appendChild(s);
    const inline = document.createElement('script');
    inline.setAttribute('data-bnoy-google', '1');
    inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`;
    document.head.appendChild(inline);
  }
  if (gtm) {
    const inline = document.createElement('script');
    inline.setAttribute('data-bnoy-google', '1');
    inline.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`;
    document.head.appendChild(inline);
  }
}
