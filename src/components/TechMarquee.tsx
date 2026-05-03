import Marquee from 'react-fast-marquee';

const techs = [
  '⚡ React','🎨 Next.js','💎 TypeScript','🌊 Tailwind CSS',
  '🔥 Supabase','💳 Razorpay','🚀 Vercel','🛡️ PostgreSQL',
];

export default function TechMarquee() {
  return (
    <section className="bg-[#1A1A2E] py-5">
      <Marquee speed={50} gradient={false} pauseOnHover>
        {[...techs, ...techs, ...techs].map((t, i) => (
          <span key={i} className="mx-4 px-4 py-2 rounded-full bg-white/10 text-white font-medium text-sm border border-white/10">
            {t}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
