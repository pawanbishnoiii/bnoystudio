import Marquee from 'react-fast-marquee';

const techItems = [
  { name: 'React', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
  { name: 'Next.js', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg', invert: true },
  { name: 'TypeScript', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
  { name: 'Tailwind CSS', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Supabase', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg' },
  { name: 'Vercel', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg', invert: true },
  { name: 'PostgreSQL', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
  { name: 'JavaScript', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
  { name: 'Node.js', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
  { name: 'Vite', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg' },
  { name: 'Python', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
  { name: 'Docker', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg' },
  { name: 'MongoDB', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg' },
  { name: 'GraphQL', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/graphql/graphql-plain.svg' },
];

export default function TechMarquee() {
  return (
    <section className="relative py-8 overflow-hidden bg-gradient-to-br from-[#fff7f1] via-[#fff1e6] to-[#ffe4d2] border-y border-fire/10">
      {/* Creative blurred orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full bg-fire/30 blur-3xl" />
        <div className="absolute -bottom-24 right-0 w-80 h-80 rounded-full bg-sun/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full bg-pink-300/20 blur-3xl" />
      </div>

      <div className="relative">
        <p className="text-center text-xs font-semibold tracking-[0.3em] text-fire/80 uppercase mb-4">
          Built with industry-leading tech
        </p>
        <Marquee speed={40} gradient gradientColor="#fff1e6" gradientWidth={80} pauseOnHover loop={0} autoFill>
          {techItems.map((tech, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 mx-3 px-5 py-3 rounded-2xl bg-white/70 border border-white shadow-[0_8px_30px_-12px_rgba(255,87,34,0.25)] backdrop-blur-md hover:bg-white hover:-translate-y-0.5 transition-all duration-300 cursor-default select-none"
            >
              <img
                src={tech.img}
                width={24} height={24}
                alt={tech.name}
                loading="lazy"
                style={tech.invert ? { filter: 'invert(0.1)' } : undefined}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="text-ink font-bold text-sm whitespace-nowrap group-hover:text-fire transition-colors">{tech.name}</span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
