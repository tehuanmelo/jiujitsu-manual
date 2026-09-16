'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface OrgChartScrollerProps {
  children: ReactNode;
  className?: string;
}

/**
 * The only client code in the org chart. It wraps the server-rendered tree
 * and only moves the scroller sideways: on load it centres the CEO column,
 * when a card is opened it centres that card (its row of reports is centred
 * under it, so that row lands in the middle too), and when the user closes a
 * card it centres the card above it. The load centring stops as soon as the
 * user scrolls or toggles. It only ever sets the horizontal offset, since `scrollIntoView` would also move the page vertically.
 *
 * `toggle` does not bubble, hence the capture listener. Browsers also fire it
 * for `<details>` that start open, so those are skipped until their first
 * toggle. Below `md` the chart is a stacked column that does not scroll, so
 * nothing happens there.
 */
function OrgChartScroller({ children, className }: OrgChartScrollerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;

    const initiallyOpen = new Set(scroller.querySelectorAll('details[open]'));
    const desktop = window.matchMedia('(min-width: 768px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Horizontal offset only: `scrollIntoView` would also move the page.
    function centre(summary: Element, behavior: ScrollBehavior) {
      if (!scroller || !desktop.matches) return;
      if (scroller.scrollWidth <= scroller.clientWidth) return;

      const card = summary.getBoundingClientRect();
      const box = scroller.getBoundingClientRect();
      const offset = card.left + card.width / 2 - (box.left + scroller.clientWidth / 2);

      scroller.scrollTo({ left: scroller.scrollLeft + offset, behavior });
    }

    // Start on the CEO column, until the user takes over the scroller.
    let userTookOver = false;
    const takeOver = () => {
      userTookOver = true;
    };
    const userInput = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;
    function centreRoot() {
      const root = scroller?.querySelector('summary');
      if (root && !userTookOver) centre(root, 'instant');
    }

    // The `<details>` whose summary the user just activated (click, or
    // Enter/Space, which also fire `click`). A card closed by another one of
    // its level opening (`details[name]`) is not this one, so it moves nothing.
    let activated: Element | null = null;
    function onClick(event: Event) {
      if (event.target instanceof Element) {
        activated = event.target.closest('summary')?.parentElement ?? null;
      }
    }

    function onToggle(event: Event) {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement)) return;
      if (initiallyOpen.delete(details)) return;
      takeOver();

      const behavior = reducedMotion.matches ? 'instant' : 'smooth';
      if (details.open) {
        const summary = details.querySelector(':scope > summary');
        if (summary) centre(summary, behavior);
      } else if (details === activated) {
        // Closed by the user: go back to the card they report to.
        const parent = details.parentElement?.closest('details');
        const summary = parent?.querySelector(':scope > summary');
        if (summary) centre(summary, behavior);
      }
      if (details === activated) activated = null;
    }

    centreRoot();
    // Fonts and late layout can shift the tree after mount; re-centre once each.
    const observer = new ResizeObserver(() => {
      observer.disconnect();
      centreRoot();
    });
    observer.observe(scroller);
    void document.fonts.ready.then(centreRoot);

    for (const type of userInput) scroller.addEventListener(type, takeOver, { passive: true });
    scroller.addEventListener('click', onClick, true);
    scroller.addEventListener('toggle', onToggle, true);
    return () => {
      observer.disconnect();
      for (const type of userInput) scroller.removeEventListener(type, takeOver);
      scroller.removeEventListener('click', onClick, true);
      scroller.removeEventListener('toggle', onToggle, true);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export { OrgChartScroller };
export type { OrgChartScrollerProps };
