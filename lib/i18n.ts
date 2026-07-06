import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'pt'],
  // locale folders inside the content dir: content/docs/en, content/docs/pt
  parser: 'dir',
  hideLocale: 'never',
});

export type Locale = (typeof i18n)['languages'][number];
