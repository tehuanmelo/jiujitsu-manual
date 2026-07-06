import { RootProvider } from 'fumadocs-ui/provider/next';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { notFound } from 'next/navigation';
import '../global.css';
import { Inter, Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { i18n } from '@/lib/i18n';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  subsets: ['latin'],
});

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
    <html
      lang={lang}
      className={cn(inter.className, 'font-sans', geist.variable)}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider i18n={provider(lang)}>{children}</RootProvider>
      </body>
    </html>
  );
}
