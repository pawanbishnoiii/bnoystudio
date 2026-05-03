import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PreviewModalProps {
  url: string | null;
  onClose: () => void;
}

export default function PreviewModal({ url, onClose }: PreviewModalProps) {
  const [loading, setLoading] = useState(true);

  if (!url) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl h-[80vh] glass-strong rounded-2xl overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-md">{url}</span>
            </div>
            <div className="flex items-center gap-2">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
              </a>
              <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* iframe */}
          <div className="relative h-[calc(100%-57px)]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-card">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
            <iframe src={url} className="w-full h-full border-0" onLoad={() => setLoading(false)} title="Project Preview" sandbox="allow-scripts allow-same-origin" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
