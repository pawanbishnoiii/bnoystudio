import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Bot, Sparkles, MessageSquare, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fixed, inline AI assistant section (no popup) — embeds the ElevenLabs
 * Conversational AI agent configured by an admin in Site Settings.
 */
export default function AISection() {
  const [ready, setReady] = useState(false);
  const holder = useRef<HTMLDivElement>(null);

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => (await supabase.from('site_settings').select('*').limit(1).maybeSingle()).data,
  });
  const agentId = ((settings as any)?.elevenlabs_agent_id || '').trim();
  const enabled = (settings as any)?.ai_section_enabled !== false;

  useEffect(() => {
    if (!agentId || !enabled) return;
    const SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = SRC;
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
    const onLoad = () => setReady(true);
    if ((window as any).customElements?.get('elevenlabs-convai')) setReady(true);
    script.addEventListener('load', onLoad);
    return () => script?.removeEventListener('load', onLoad);
  }, [agentId, enabled]);

  useEffect(() => {
    if (!ready || !agentId || !holder.current) return;
    holder.current.innerHTML = '';
    const el = document.createElement('elevenlabs-convai');
    el.setAttribute('agent-id', agentId);
    el.setAttribute('variant', 'expanded');
    el.style.setProperty('--elevenlabs-convai-position', 'static');
    holder.current.appendChild(el);
  }, [ready, agentId]);

  if (!enabled) return null;

  return (
    <section id="ai-assistant" className="relative py-20 iris-mesh overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full iris-panel text-xs font-bold uppercase tracking-[0.18em]">
              <Sparkles className="h-3.5 w-3.5 text-iris" /> AI Assistant
            </span>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl font-extrabold leading-tight">
              Talk to our <span className="iris-text">AI project guide</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg">
              Ask anything about a project — tech stack, licensing, deployment, versions or pricing.
              Voice or text, right here on the page. No popups, no waiting.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: <MessageSquare className="h-3.5 w-3.5 text-iris" />, label: 'Instant answers' },
                { icon: <Mic className="h-3.5 w-3.5 text-aqua-deep" />, label: 'Voice enabled' },
                { icon: <Bot className="h-3.5 w-3.5 text-iris" />, label: 'Knows the catalog' },
              ].map((c) => (
                <span key={c.label} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border text-sm font-medium shadow-card">
                  {c.icon}{c.label}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="rounded-3xl iris-panel glow-iris p-4 min-h-[380px] flex items-center justify-center"
          >
            {agentId ? (
              <div ref={holder} className="w-full min-h-[340px] flex items-center justify-center [&_elevenlabs-convai]:w-full" />
            ) : (
              <div className="text-center px-6 py-12">
                <div className="mx-auto h-14 w-14 rounded-2xl gradient-iris flex items-center justify-center glow-iris">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <p className="mt-4 font-display font-bold">AI assistant not configured yet</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                  An admin can paste an ElevenLabs Agent ID in Admin → Site Settings to activate the live chat here.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
