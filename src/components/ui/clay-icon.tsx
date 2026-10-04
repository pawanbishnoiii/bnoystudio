import iconAtlas from '@/assets/generated/icon-atlas.webp';
import { cn } from '@/lib/utils';

export type ClayIconName =
  | 'rocket'
  | 'code'
  | 'shield'
  | 'store'
  | 'analytics'
  | 'magic'
  | 'download'
  | 'team'
  | 'modules'
  | 'bolt';

const atlasPosition: Record<ClayIconName, string> = {
  rocket: '0% 0%',
  code: '25% 0%',
  shield: '50% 0%',
  store: '75% 0%',
  analytics: '100% 0%',
  magic: '0% 100%',
  download: '25% 100%',
  team: '50% 100%',
  modules: '75% 100%',
  bolt: '100% 100%',
};

export function ClayIcon({ name, className }: { name: ClayIconName; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block shrink-0 bg-no-repeat drop-shadow-[0_14px_20px_rgba(8,13,25,0.22)]', className)}
      style={{
        backgroundImage: `url(${iconAtlas})`,
        backgroundSize: '500% 200%',
        backgroundPosition: atlasPosition[name],
      }}
    />
  );
}
