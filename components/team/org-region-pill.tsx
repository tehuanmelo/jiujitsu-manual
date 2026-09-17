import type { RegionNode } from '@/lib/team';
import { cn } from '@/lib/utils';

interface OrgRegionPillProps {
  node: RegionNode;
  lang?: string;
  className?: string;
}

const COPY = {
  en: { one: 'supervisor', many: 'supervisors' },
  pt: { one: 'supervisor', many: 'supervisores' },
} as const;

/**
 * One region under the Technical Manager. Server component for the same
 * reasons as `org-node-card.tsx`, hence the same literal chevron.
 *
 * Not interactive itself: `org-chart.tsx` puts it inside a `<summary>`.
 *
 * Mobile: `min-h-20` puts the pill's middle 40px below the top of its row,
 * where the `LI` connector elbow (`after:top-14`, under `pt-4`) meets it.
 * Desktop: a fixed `w-36` so the four pills fit the prose column side by side.
 */
function OrgRegionPill({ node, lang = 'en', className }: OrgRegionPillProps) {
  const t = lang === 'pt' ? COPY.pt : COPY.en;
  const count = node.children.length;

  return (
    <div
      className={cn(
        'flex min-h-20 w-full items-center justify-between gap-3 rounded-full border border-border bg-card px-6 shadow-sm',
        'transition-[transform,box-shadow,border-color] duration-200 ease-out motion-reduce:transition-none',
        'md:min-h-0 md:w-36 md:shrink-0 md:flex-col md:justify-center md:gap-0.5 md:px-4 md:py-2.5 md:text-center',
        'md:hover:-translate-y-0.5 md:hover:border-[var(--brand-text)]/40 md:hover:shadow-lg',
        'md:focus-within:-translate-y-0.5 md:focus-within:border-[var(--brand-text)]/40 md:focus-within:shadow-lg',
        className,
      )}
    >
      <div className="min-w-0 md:w-full">
        <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">{node.name}</h3>
        <p className="mt-0.5 truncate text-[0.6875rem] leading-[1.3] text-muted-foreground">
          {`${count} ${count === 1 ? t.one : t.many}`}
        </p>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none in-[details[open]>summary]:rotate-180"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export { OrgRegionPill };
export type { OrgRegionPillProps };
