import { localize, rankRing, roman, rolesByLevelDesc, staffedRoles } from '@/lib/team';
import { cn } from '@/lib/utils';

interface OrgLegendProps {
  lang?: string;
  className?: string;
}

const COPY = {
  en: { levels: 'Levels', vacant: 'Vacant' },
  pt: { levels: 'Níveis', vacant: 'Vago' },
} as const;

function copyFor(lang: string) {
  return lang === 'pt' ? COPY.pt : COPY.en;
}

/**
 * Maps arc count to rank. A role nobody currently holds gets a dashed border
 * and the word "Vacant" — not an opacity fade, which would fail contrast and
 * say nothing at all to a screen reader.
 */
function OrgLegend({ lang = 'en', className }: OrgLegendProps) {
  const t = copyFor(lang);
  const staffed = staffedRoles();

  return (
    <div className={cn('not-prose mt-2', className)}>
      <h3 className="mb-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {t.levels}
      </h3>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {rolesByLevelDesc().map(([key, role]) => {
          const isStaffed = staffed.has(key);
          return (
            <li
              key={key}
              className={cn(
                'flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1.5 pr-3',
                !isStaffed && 'border-dashed',
              )}
            >
              {/* A real annulus: the gradient is the padding band and the inner
                  span paints the hole. `background-clip: content-box` does the
                  opposite of what it looks like — it fills the disc. */}
              <span
                className="size-5 shrink-0 rounded-full p-[2px]"
                style={{ background: rankRing(role.level) }}
                aria-hidden="true"
              >
                <span className="block size-full rounded-full bg-card" />
              </span>
              <span className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.1em] text-[var(--brand-text)]">
                {roman(role.level)}
              </span>
              <span className="text-xs font-medium text-foreground">
                {localize(role.label, lang)}
              </span>
              {!isStaffed ? (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-foreground">
                  {t.vacant}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { OrgLegend };
export type { OrgLegendProps };
