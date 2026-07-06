import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { LanguageToggle } from '@/components/language-toggle';
import { appName } from './shared';

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
      url: `/${locale}`,
    },
    links: [
      {
        type: 'custom',
        secondary: true,
        children: <LanguageToggle locale={locale} />,
      },
    ],
  };
}
