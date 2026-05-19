import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Loader2, Monitor, Tablet, Smartphone, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PreviewModalProps {
  url: string | null;
  onClose: () => void;
  watermark?: string | null;
  title?: string;
}

type Device = 'desktop' | 'tablet' | 'mobile';
const SIZES: Record<Device, { w: number; h: number; label: string }> = {
  desktop: { w: 1280, h: 800, label: '1280×800' },
  tablet: { w: 820, h: 1180, label: '820×1180' },
  mobile: { w: 390, h: 844, label: '390×844' },
};

export default function PreviewModal({ url, onClose, watermark, title }: PreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<Device>('desktop');
  const [reloadKey, setReloadKey] = useState(0);

  if (!url) return null;
  const size = SIZES[device];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[95vw] h-[90vh] bg-white rounded-2xl overflow-hidden border border-border shadow-card-hover flex flex-col"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 p-3 border-b border-border bg-warm-bg flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-sun" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs font-semibold text-ink truncate max-w-[160px] md:max-w-md">{title || 'Live preview'}</span>
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-white border border-border rounded-full">
              {([
                ['desktop', Monitor],
                ['tablet', Tablet],
                ['mobile', Smartphone],
              ] as const).map(([key, Icon]) => (
                <button key={key} onClick={() => setDevice(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${device === key ? 'gradient-fire-strong text-white shadow' : 'text-muted-foreground hover:text-ink'}`}>
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline capitalize">{key}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground hidden md:inline">{size.label}</span>
              <Button variant="ghost" size="sm" onClick={() => { setLoading(true); setReloadKey(k => k + 1); }}><RefreshCw className="h-4 w-4" /></Button>
              {/* External-open link hidden so visitors cannot easily grab the source URL */}
              <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Frame */}
          <div className="flex-1 overflow-auto bg-[radial-gradient(circle,_hsl(24_60%_92%)_1px,_transparent_1px)] [background-size:18px_18px] flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-xl shadow-card-hover overflow-hidden border border-border transition-all duration-300"
              style={{ width: Math.min(size.w, window.innerWidth - 80), height: Math.min(size.h, window.innerHeight - 200) }}
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <Loader2 className="h-8 w-8 text-fire animate-spin" />
                </div>
              )}
              <iframe key={reloadKey} src={url} className="w-full h-full border-0" onLoad={() => setLoading(false)}
                title="Project Preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
