import { orgTree, type OrgNode } from '@/lib/team';
import styles from '@/components/team/org-chart.module.css';
import { OrgLegend } from '@/components/team/org-legend';
import { OrgNodeCard } from '@/components/team/org-node-card';
import { cn } from '@/lib/utils';

interface OrgChartProps {
  lang?: string;
  className?: string;
}

const COPY = {
  en: { heading: 'Leadership org chart' },
  pt: { heading: 'Organograma da liderança' },
} as const;

const HEADING_ID = 'org-chart-heading';

/**
 * Connectors are pseudo-elements, written out as literal class strings.
 *
 * Two rules hold this together:
 *  1. Horizontal spacing is `px-*` on the `<li>`, never `gap-*` on the `<ul>`.
 *     The sibling bar is two half-width pseudo-elements that have to meet in
 *     the middle; a flex gap pulls them apart and the line breaks.
 *  2. The desktop tree is `md:` only, never paired with a `max-md:` query. A
 *     fractional viewport (767.4px, routine at 125% zoom) matches neither, and
 *     every connector would vanish.
 *
 * `before:content-['']` is not needed: Tailwind v4 emits
 * `content: var(--tw-content)` for every before/after utility.
 */
const LI =
  'relative pt-4 pl-6 before:absolute before:left-2.5 before:top-0 before:w-px before:h-full before:bg-border last:before:h-14 after:absolute after:left-2.5 after:top-14 after:w-3.5 after:h-px after:bg-border md:flex md:flex-col md:items-center md:pt-10 md:px-3 md:before:top-5 md:before:left-0 md:before:w-1/2 md:before:h-px md:last:before:h-px md:first:before:hidden md:after:top-5 md:after:left-1/2 md:after:w-1/2 md:after:h-px md:last:after:hidden';

const ROOT_LI =
  'relative pl-0 before:hidden after:hidden md:flex md:flex-col md:items-center md:pt-0 md:px-3';

/** Drops from the sibling bar down onto the card. */
const RISER =
  'hidden md:block md:absolute md:left-1/2 md:top-5 md:w-px md:h-5 md:-translate-x-1/2 md:bg-border';

const CHILDREN_UL =
  'list-none md:relative md:flex md:justify-center md:before:absolute md:before:left-1/2 md:before:top-0 md:before:w-px md:before:h-5 md:before:-translate-x-1/2 md:before:bg-border';

/**
 * `md:px-3` matches the `<li>` padding, so the tree measures ~816px and clears
 * the 825px prose column at 1440. `md:px-4` lands at ~824px — inside the
 * column by 1px, which the next font-metric change would turn into overflow.
 */
const ROOT_UL = 'list-none md:flex md:w-max md:mx-auto md:px-3';

interface BranchProps {
  node: OrgNode;
  lang: string;
  isRoot?: boolean;
}

function Branch({ node, lang, isRoot = false }: BranchProps) {
  const hasChildren = node.children.length > 0;

  return (
    <li className={isRoot ? ROOT_LI : LI}>
      {isRoot ? null : <span className={RISER} aria-hidden="true" />}
      <OrgNodeCard node={node} lang={lang} />
      {hasChildren ? (
        <ul className={CHILDREN_UL}>
          {node.children.map((child) => (
            <Branch key={child.person.id} node={child} lang={lang} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Reads inside the MDX prose column, so `not-prose` is mandatory — Fumadocs'
 * typography would otherwise restyle the lists, headings and portraits.
 *
 * The scroller uses `md:w-max md:mx-auto` rather than `justify-center`: a
 * centred flex container puts its own left overflow out of reach once it
 * scrolls. `md:overflow-x-auto` also resolves `overflow-y` to `auto`, which
 * would clip the cards' hover lift and shadow — that is what the vertical
 * padding on the scroller is for. Do not trim it.
 *
 * Between 1280 and 1366 the tree genuinely is wider than the column and has to
 * scroll; `styles.scroller` is what says so, and `styles.chart` is the query
 * container it measures the column against. See the module for why the cue is
 * a mask rather than a gradient overlay.
 */
function OrgChart({ lang = 'en', className }: OrgChartProps) {
  const t = lang === 'pt' ? COPY.pt : COPY.en;

  return (
    <section
      aria-labelledby={HEADING_ID}
      className={cn('not-prose my-6 w-full', styles.chart, className)}
    >
      <h2 id={HEADING_ID} className="sr-only">
        {t.heading}
      </h2>

      <div
        className={cn(
          'w-full md:overflow-x-auto md:overscroll-x-contain md:pb-6 md:pt-8',
          styles.scroller,
        )}
      >
        <ul className={ROOT_UL}>
          <Branch node={orgTree} lang={lang} isRoot />
        </ul>
      </div>

      <OrgLegend lang={lang} className="mt-6 md:mt-4" />
    </section>
  );
}

export { OrgChart };
export type { OrgChartProps };
