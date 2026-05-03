import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Github, Twitter, Linkedin, Mail, Instagram, Youtube, ShoppingBag, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

function WhatsAppFloating({ number }: { number: string }) {
  const num = (number || '+919999999999').replace(/[^\d]/g, '');
  return (
    <a href={`https://wa.me/${num}`} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105 font-medium text-sm">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ animation: 'wa-pulse 2s infinite' }} aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.859L.057 23.428a.75.75 0 00.919.937l5.655-1.48A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.847 0-3.575-.484-5.076-1.33l-.361-.209-3.742.979.998-3.648-.235-.374A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}

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
      <WhatsAppFloating number={s?.whatsapp_number || '+919999999999'} />
    </footer>
  );
}
