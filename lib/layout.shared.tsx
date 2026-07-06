import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName } from './shared';

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
      url: `/${locale}`,
    },
    // the built-in language select renders automatically: RootProvider
    // receives the i18n locales + display names in app/[lang]/layout.tsx
  };
}
