import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'What do I get after purchase?', a: 'You receive the complete source code as a ZIP file. The code is clean, well-documented, and ready to deploy on Vercel or any other platform.' },
  { q: 'Can I use the projects for commercial purposes?', a: 'Yes! All purchased projects come with a commercial license. You can use them for client work, personal projects, or your own startup.' },
  { q: 'Do you offer refunds?', a: 'Due to the digital nature of our products, we do not offer refunds once the source code has been downloaded. However, you can preview all projects before purchasing.' },
  { q: 'What technologies are used?', a: 'Our projects are built with React, Next.js, TypeScript, Tailwind CSS, and other modern technologies. Each project listing shows the exact tech stack used.' },
  { q: 'Do you provide support?', a: 'Yes, we provide email support for all purchased projects. We help with setup, deployment, and basic customization questions.' },
  { q: 'Can I preview projects before buying?', a: 'Absolutely! Every project has a live preview button that opens the actual running application in a popup so you can explore it fully.' },
];

export default function FAQSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass rounded-xl border-0 px-6 overflow-hidden">
                <AccordionTrigger className="font-display font-semibold text-left hover:no-underline hover:text-primary">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
