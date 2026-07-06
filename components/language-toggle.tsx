'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/cn';

/**
 * Single-flag locale toggle rendered in the fumadocs navbar, next to the
 * theme toggle and search icon buttons. Shows the flag of the *other*
 * locale; clicking navigates to the same page in that locale.
 */
export function LanguageToggle({ locale }: { locale: string }) {
  const pathname = usePathname();

  const otherLocale = locale === 'en' ? 'pt' : 'en';
  const flag = locale === 'en' ? '🇧🇷' : '🇺🇸';
  const label = locale === 'en' ? 'Mudar para Português' : 'Switch to English';

  // Swap the leading locale segment: /en/docs/x → /pt/docs/x, /en → /pt.
  let href = `/${otherLocale}`;
  const match = pathname?.match(/^\/(en|pt)(\/.*)?$/);
  if (match) href = `/${otherLocale}${match[2] ?? ''}`;

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        buttonVariants({
          color: 'ghost',
          size: 'icon',
        }),
      )}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {flag}
      </span>
    </Link>
  );
}
