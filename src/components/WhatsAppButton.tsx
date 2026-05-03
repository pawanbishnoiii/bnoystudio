import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      return data;
    },
  });
  const num = (data?.whatsapp_number || '+919999999999').replace(/[^\d]/g, '');
  const href = `https://wa.me/${num}?text=Hi%20DevMarket%2C%20I%20need%20help`;
  return (
    <motion.a
      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
      href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
      className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-card-hover flex items-center justify-center hover:shadow-xl">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.86 2.722.86.36 0 1.633-.353 1.905-.985.13-.31.143-.6.143-.94-.026-.388-1.448-1.06-1.764-1.06zm-2.69 7.847c-1.59 0-3.137-.43-4.486-1.246l-3.21 1.027 1.05-3.106A8.673 8.673 0 0 1 7.726 16c0-4.787 3.91-8.683 8.695-8.683C21.21 7.317 25 11.213 25 16c0 4.787-3.91 8.683-8.695 8.683zm0-19.166c-5.78 0-10.482 4.7-10.482 10.483 0 1.97.554 3.872 1.59 5.523L5 27.717l5.96-1.91c1.595.873 3.387 1.347 5.213 1.347 5.782 0 10.486-4.704 10.486-10.487s-4.704-10.484-10.486-10.484z"/>
      </svg>
    </motion.a>
  );
}
