import { motion } from 'framer-motion';
import { Eye, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    short_desc: string;
    price: number;
    thumbnail_url: string | null;
    tech_stack: string[];
    category: string[];
    preview_url: string | null;
  };
  onPreview?: (url: string) => void;
  onBuy?: (project: any) => void;
  index?: number;
}

export default function ProjectCard({ project, onPreview, onBuy, index = 0 }: ProjectCardProps) {
  const { user, setShowAuthModal } = useAuthStore();

  const handleBuy = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onBuy?.(project);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group animated-gradient-border rounded-2xl overflow-hidden"
    >
      <div className="bg-card rounded-2xl overflow-hidden h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={project.thumbnail_url || '/placeholder.svg'}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground border-0">
              {project.price === 0 ? 'FREE' : `₹${project.price.toLocaleString('en-IN')}`}
            </Badge>
          </div>
          {project.preview_url && (
            <button
              onClick={() => onPreview?.(project.preview_url!)}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="glass rounded-full p-3">
                <Eye className="h-6 w-6 text-accent" />
              </div>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <Link to={`/project/${project.id}`}>
            <h3 className="font-display text-lg font-semibold hover:text-primary transition-colors mb-2">{project.title}</h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{project.short_desc}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tech_stack.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs border-border text-muted-foreground">{tag}</Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {project.preview_url && (
              <Button variant="outline" size="sm" className="flex-1 border-border" onClick={() => onPreview?.(project.preview_url!)}>
                <Eye className="h-4 w-4 mr-1" /> Preview
              </Button>
            )}
            <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90" onClick={handleBuy}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              {project.price === 0 ? 'Get Free' : 'Buy Now'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
