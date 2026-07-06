import { RootProvider } from 'fumadocs-ui/provider/next';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { notFound } from 'next/navigation';
import { HtmlLang } from '@/components/html-lang';
import { i18n } from '@/lib/i18n';

const { provider } = defineI18nUI(i18n, {
  en: {
    displayName: 'English',
  },
  pt: {
    displayName: 'Português',
    search: 'Buscar',
    searchNoResult: 'Nenhum resultado encontrado',
    toc: 'Nesta página',
    tocNoHeadings: 'Sem títulos',
    lastUpdate: 'Última atualização',
    chooseLanguage: 'Escolher idioma',
    nextPage: 'Próxima página',
    previousPage: 'Página anterior',
    chooseTheme: 'Tema',
    editOnGithub: 'Editar no GitHub',
  },
});

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!i18n.languages.includes(lang as never)) notFound();

  return (
    // theme is disabled here because the stable root layout already provides
    // it — see the comment in app/layout.tsx
    <RootProvider i18n={provider(lang)} theme={{ enabled: false }}>
      <HtmlLang lang={lang} />
      {children}
    </RootProvider>
  );
}
