import { motion } from 'framer-motion';
import { Eye, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: {
    id: string; title: string; short_desc: string; price: number;
    thumbnail_url: string | null; tech_stack: string[]; category: string[]; preview_url: string | null;
    views_count?: number; likes_count?: number;
  };
  onPreview?: (url: string) => void;
  onBuy?: (project: any) => void;
  index?: number;
}

export default function ProjectCard({ project, onPreview, onBuy, index = 0 }: ProjectCardProps) {
  const { user, setShowAuthModal } = useAuthStore();
  const isFree = project.price === 0;
  const views = project.views_count ?? 0;

  const handleBuy = () => {
    if (!user) {
      setShowAuthModal(true, isFree ? 'Sign in to download this free project.' : `Sign in to buy "${project.title}".`);
      return;
    }
    onBuy?.(project);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.07, duration: 0.45 }}
      whileHover={{ scale: 1.02 }}
      className="group bg-white rounded-2xl overflow-hidden border border-border shadow-card card-hover flex flex-col"
    >
      <Link to={`/project/${project.id}`} className="relative aspect-video overflow-hidden bg-gradient-to-br from-fire/15 to-sun/20 block">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full gradient-fire" />
        )}
        <div className="absolute top-3 right-3">
          {isFree ? (
            <Badge className="bg-green-500 text-white border-0">FREE</Badge>
          ) : (
            <Badge className="gradient-fire-strong text-white border-0">₹{project.price.toLocaleString('en-IN')}</Badge>
          )}
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <Link to={`/project/${project.id}`}>
          <h3 className="font-display text-base font-bold text-ink hover:text-fire transition-colors">{project.title}</h3>
        </Link>
        <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1 mb-3 flex-1">{project.short_desc}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack?.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted border border-border text-ink/70">{tag}</span>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">👁 {views.toLocaleString()}</span>
        </div>

        <div className="flex gap-2">
          {project.preview_url && (
            <Button variant="outline" size="sm" className="flex-1 border-border" onClick={() => onPreview?.(project.preview_url!)}>
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
          )}
          <Button size="sm" className="flex-1 gradient-fire-strong text-white hover:opacity-95" onClick={handleBuy}>
            {!user ? <Lock className="h-4 w-4 mr-1" /> : <ShoppingCart className="h-4 w-4 mr-1" />}
            {isFree ? 'Get Free' : 'Buy Now'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
