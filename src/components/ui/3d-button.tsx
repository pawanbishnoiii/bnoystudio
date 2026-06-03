import * as React from 'react';
import { cn } from '@/lib/utils';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/** 3D press button with depth shadow + arrow swipe on hover. Used as hero "Get Started". */
export const Hero3DButton = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, label = 'Get Started', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'group relative inline-flex items-center justify-center gap-3',
          'rounded-2xl px-7 py-3 text-base font-bold tracking-tight text-white',
          'bg-gradient-to-br from-fire via-fire to-sun',
          'shadow-[0_8px_0_0_hsl(14_100%_38%),0_10px_30px_-6px_hsl(14_100%_50%/.55)]',
          'transition-[transform,box-shadow] duration-150 will-change-transform',
          'hover:-translate-y-0.5 hover:shadow-[0_10px_0_0_hsl(14_100%_38%),0_18px_38px_-6px_hsl(14_100%_50%/.65)]',
          'active:translate-y-1 active:shadow-[0_2px_0_0_hsl(14_100%_38%),0_4px_18px_-4px_hsl(14_100%_50%/.5)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
          className,
        )}
        {...props}
      >
        <span className="relative z-10">{children || label}</span>
        <span className="relative z-10 grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-white/20 backdrop-blur">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 -translate-x-3 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            className="absolute h-4 w-4 transition-all duration-300 group-hover:translate-x-6 group-hover:opacity-0"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>
    );
  },
);
Hero3DButton.displayName = 'Hero3DButton';

export default Hero3DButton;
