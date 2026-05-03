import Marquee from 'react-fast-marquee';
import { Star } from 'lucide-react';

const items = [
  { name: 'E-Commerce Pro', price: '₹4,999' },
  { name: 'SaaS Dashboard', price: '₹7,999' },
  { name: 'Portfolio Studio', price: 'FREE' },
  { name: 'AI Chat App', price: '₹5,999' },
  { name: 'Blog CMS', price: '₹2,999' },
  { name: 'Admin Panel', price: '₹6,499' },
  { name: 'Landing Page Kit', price: 'FREE' },
  { name: 'Social Media App', price: '₹9,999' },
];

export default function MarqueeTicker() {
  return (
    <div className="py-4 border-y border-border bg-secondary/30">
      <Marquee speed={40} gradient={false} pauseOnHover>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 mx-8">
            <Star className="h-4 w-4 text-accent" />
            <span className="font-display font-semibold text-foreground">{item.name}</span>
            <span className="text-sm px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">{item.price}</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
