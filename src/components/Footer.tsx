import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ShoppingBag } from 'lucide-react';

export default function Footer() {
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
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold mb-3 text-ink">Company</h4>
            <div className="space-y-2">
              <Link to="/#how" className="block text-sm text-muted-foreground hover:text-fire">How it works</Link>
              <Link to="/#faq" className="block text-sm text-muted-foreground hover:text-fire">FAQ</Link>
              <a href="mailto:hello@devmarket.in" className="block text-sm text-muted-foreground hover:text-fire">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold mb-3 text-ink">Support</h4>
            <p className="text-sm text-muted-foreground">help@devmarket.in</p>
            <p className="text-sm text-muted-foreground">Mon–Sat, 10AM–6PM IST</p>
            <div className="flex gap-2 mt-3">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-fire hover:border-fire/40 transition-colors">
                  <Icon className="h-4 w-4" />
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
