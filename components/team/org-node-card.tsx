import { localize, rankRing, roman, type OrgNode } from '@/lib/team';
import { cn } from '@/lib/utils';

interface OrgNodeCardProps {
  node: OrgNode;
  lang?: string;
  className?: string;
}

const COPY = {
  en: { responsibility: 'Responsibility', level: 'Level' },
  pt: { responsibility: 'Responsabilidade', level: 'Nível' },
} as const;

function copyFor(lang: string) {
  return lang === 'pt' ? COPY.pt : COPY.en;
}

/**
 * One person. Server component on purpose — no client directive anywhere in this
 * tree, so eleven of these cost nothing on the wire. That rules out
 * `lucide-react` (its Icon.mjs carries the client directive and every icon imports it)
 * and `components/ui/avatar.tsx` (client, plus its Root injects an
 * `after:border` hairline that would sit inside the rank ring). Hence the
 * literal chevron below and a plain `<img>` — `next/image` would refuse these
 * SVG portraits without `images.dangerouslyAllowSVG`.
 *
 * The reveal covers ONLY the reserved band under the divider. The name, role
 * and base stay visible at all times: a responsibility you can read without
 * knowing whose it is has no value, and covering the name on hover fails
 * WCAG 1.4.13. The blurb is hidden with opacity/translate rather than
 * `display: none` so it stays in the accessibility tree.
 */
function OrgNodeCard({ node, lang = 'en', className }: OrgNodeCardProps) {
  const { person, role } = node;
  const t = copyFor(lang);
  const label = localize(role.label, lang);
  const blurb = localize(role.blurb, lang);

  return (
    <div
      className={cn(
        'group relative w-full rounded-xl border border-border bg-card p-4 shadow-sm',
        // Mobile: a grid, not a flex row — a row lets the blurb squeeze the
        // name into a sliver. `md:flex` cleanly overrides `grid` (equal
        // specificity, later in the compiled sheet).
        "grid grid-cols-[auto_minmax(0,1fr)_auto] [grid-template-areas:'ring_id_level'_'band_band_band'] items-start gap-x-3.5 gap-y-1",
        'transition-[transform,box-shadow,border-color] duration-200 ease-out motion-reduce:transition-none',
        'md:flex md:h-71 md:w-44 md:shrink-0 md:flex-col md:items-stretch md:overflow-hidden md:p-0 md:text-center',
        'md:hover:-translate-y-0.5 md:hover:border-[var(--brand-text)]/40 md:hover:shadow-lg',
        'md:focus-within:-translate-y-0.5 md:focus-within:border-[var(--brand-text)]/40 md:focus-within:shadow-lg',
        className,
      )}
    >
      {/* `contents` on mobile so ring / identity / level stay direct grid
          items; at md this becomes the fixed 180px block above the band. */}
      <div className="contents md:flex md:h-45 md:w-full md:shrink-0 md:flex-col md:items-center md:justify-center md:px-3 md:pb-1.5">
        {/* Rank ring: one arc per level, straight from the data. The arcs are
            the padding band of this element, so it is a true annulus. */}
        <span
          className="[grid-area:ring] size-12 shrink-0 rounded-full p-[3px] md:size-20 md:p-1"
          style={{ background: rankRing(role.level) }}
        >
          <span className="block size-full rounded-full bg-card p-px">
            <img
              src={person.photo}
              alt=""
              width={80}
              height={80}
              loading="lazy"
              decoding="async"
              className="size-full rounded-full object-cover"
            />
          </span>
        </span>

        <div className="[grid-area:id] min-w-0 md:mt-3 md:w-full">
          <h3 className="truncate text-sm font-semibold tracking-tight text-foreground md:text-[0.9375rem]">
            {person.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-[0.6875rem] font-medium uppercase leading-[1.3] tracking-[0.09em] text-[var(--brand-text)]">
            {label}
          </p>
          {person.base ? (
            <p className="mt-0.5 truncate text-[0.6875rem] leading-[1.3] text-muted-foreground">
              {person.base}
            </p>
          ) : null}
        </div>

        <p className="[grid-area:level] shrink-0 text-[0.6875rem] font-semibold tabular-nums leading-5 tracking-[0.12em] text-[var(--brand-text)] md:absolute md:right-2.5 md:top-2.5 md:leading-none">
          <span className="sr-only">{`${t.level} ${role.level} — `}</span>
          <span aria-hidden="true">{roman(role.level)}</span>
        </p>
      </div>

      {/* Reserved band. Fixed height at md so the panel fills it exactly and
          covers nothing above the divider. */}
      <div className="[grid-area:band] mt-1 border-t border-border pt-2 md:relative md:mt-0 md:h-26 md:w-full md:shrink-0 md:overflow-hidden md:pt-0">
        <span
          aria-hidden="true"
          className="hidden transition-opacity duration-200 motion-reduce:transition-none md:absolute md:inset-0 md:flex md:items-center md:justify-center md:gap-1.5 md:text-[0.6875rem] md:font-medium md:uppercase md:tracking-[0.12em] md:text-muted-foreground md:group-hover:opacity-0 md:group-focus-within:opacity-0"
        >
          {t.responsibility}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3"
          >
            <path d="m6 15 6-6 6 6" />
          </svg>
        </span>

        <span className="block transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none md:absolute md:inset-0 md:grid md:translate-y-full md:place-items-center md:bg-brand md:px-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          <span className="line-clamp-5 text-xs leading-[1.45] text-muted-foreground md:text-[0.8125rem] md:leading-[1.35] md:text-white">
            {blurb}
          </span>
        </span>
      </div>
    </div>
  );
}

export { OrgNodeCard };
export type { OrgNodeCardProps };
