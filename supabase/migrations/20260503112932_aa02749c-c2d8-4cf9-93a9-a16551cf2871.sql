
-- Site settings table (single-row config)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number TEXT DEFAULT '+919999999999',
  support_email TEXT DEFAULT 'help@devmarket.in',
  phone TEXT DEFAULT '+91 99999 99999',
  address TEXT DEFAULT 'Bengaluru, Karnataka, India',
  social_github TEXT DEFAULT 'https://github.com',
  social_twitter TEXT DEFAULT 'https://twitter.com',
  social_linkedin TEXT DEFAULT 'https://linkedin.com',
  social_instagram TEXT DEFAULT 'https://instagram.com',
  social_youtube TEXT DEFAULT '',
  refund_policy TEXT DEFAULT 'We offer a 7-day refund policy on paid products if the source code is faulty or undelivered. Free products are not eligible for refunds. Contact support to initiate a refund request.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed default row
INSERT INTO public.site_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Seed 4 more projects (total = 10)
INSERT INTO public.projects (title, short_desc, full_desc, price, category, tech_stack, thumbnail_url, preview_url, featured, status, screenshots) VALUES
('NovaBlog CMS', 'Modern markdown blog with admin dashboard, SEO and dark mode.',
 '<p>NovaBlog is a production-ready markdown CMS with built-in admin, SEO meta tags, image uploads, and an elegant dark mode reader.</p>',
 999, ARRAY['Blog','Next.js','CMS'], ARRAY['Next.js','TypeScript','Tailwind','Supabase'],
 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
 'https://nextjs.org', true, 'published',
 ARRAY['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80']),

('PulseChat AI', 'GPT-powered chatbot SaaS with streaming responses & history.',
 '<p>Build your own AI assistant in minutes. Streaming OpenAI responses, multi-conversation history, dark mode, prompt templates.</p>',
 2499, ARRAY['AI','SaaS','Chat'], ARRAY['React','OpenAI','Tailwind','Vercel'],
 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
 'https://chat.openai.com', true, 'published', ARRAY[]::text[]),

('CoinPulse Tracker', 'Real-time cryptocurrency portfolio tracker with charts.',
 '<p>Track your crypto portfolio in real time. Live prices, candlestick charts, watchlists, dark UI.</p>',
 0, ARRAY['Crypto','Dashboard','Free'], ARRAY['React','Recharts','CoinGecko API'],
 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
 'https://www.coingecko.com', false, 'published', ARRAY[]::text[]),

('Estate Pro', 'Real estate listing platform with map search & filters.',
 '<p>Full real-estate marketplace with property listings, map-based search, advanced filters, image galleries.</p>',
 1799, ARRAY['Real Estate','Marketplace'], ARRAY['Next.js','Mapbox','Tailwind','Postgres'],
 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
 'https://www.airbnb.com', false, 'published', ARRAY[]::text[]);
