'use client';

import { useEffect } from 'react';

/**
 * Keeps <html lang> in sync with the active locale. The html element is
 * rendered by the static root layout (which cannot know the locale), so the
 * attribute is updated here whenever the [lang] segment changes.
 */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
