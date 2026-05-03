import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Github, Twitter, Linkedin, Mail, Instagram, Youtube, ShoppingBag, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Footer() {
  const { data: s } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => (await supabase.from('site_settings').select('*').limit(1).maybeSingle()).data,
  });

  const socials = [
    { icon: Github, url: s?.social_github },
    { icon: Twitter, url: s?.social_twitter },
    { icon: Linkedin, url: s?.social_linkedin },
    { icon: Instagram, url: s?.social_instagram },
    { icon: Youtube, url: s?.social_youtube },
    { icon: Mail, url: s?.support_email ? `mailto:${s.support_email}` : null },
  ].filter((x) => x.url);

  return (
    <footer className="border-t border-border py-12 warm-bg">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl gradient-fire-strong flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-xl font-extrabold text-ink">Dev<span className="gradient-text">Market</span></span>
            </Link>
            <p className="text-sm text-muted-foreground">Premium web projects marketplace. Buy production-ready code and launch faster.</p>
          </div>

          <div>
            <h4 className="font-display font-bold mb-3 text-ink">Products</h4>
            <div className="space-y-2">
              <Link to="/marketplace" className="block text-sm text-muted-foreground hover:text-fire">All Projects</Link>
              <Link to="/marketplace" className="block text-sm text-muted-foreground hover:text-fire">Free Templates</Link>
              <Link to="/marketplace" className="block text-sm text-muted-foreground hover:text-fire">SaaS Starters</Link>
              <Link to="/refund" className="block text-sm text-muted-foreground hover:text-fire">Refund Policy</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold mb-3 text-ink">Company</h4>
            <div className="space-y-2">
              <Link to="/#how" className="block text-sm text-muted-foreground hover:text-fire">How it works</Link>
              <Link to="/#faq" className="block text-sm text-muted-foreground hover:text-fire">FAQ</Link>
              <a href={`mailto:${s?.support_email || 'hello@devmarket.in'}`} className="block text-sm text-muted-foreground hover:text-fire">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold mb-3 text-ink">Get in touch</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-fire" />{s?.support_email || 'help@devmarket.in'}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-fire" />{s?.phone || '+91 99999 99999'}</p>
              <p className="flex items-start gap-2"><MapPin className="h-4 w-4 text-fire mt-0.5" />{s?.address || 'Bengaluru, India'}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {socials.map((soc, i) => (
                <a key={i} href={soc.url!} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-fire hover:border-fire/40 transition-colors">
                  <soc.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} DevMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
