import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border py-12 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold gradient-text">DevMarket</span>
            </div>
            <p className="text-sm text-muted-foreground">Premium web projects marketplace. Buy production-ready projects and launch faster.</p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/marketplace" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
              <Link to="/#about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <div className="space-y-2">
              <span className="block text-sm text-muted-foreground">help@devmarket.in</span>
              <span className="block text-sm text-muted-foreground">Mon-Sat, 10AM-6PM IST</span>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} DevMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
