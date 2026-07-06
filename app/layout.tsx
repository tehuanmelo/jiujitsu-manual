import { ThemeProvider } from 'next-themes';
import './global.css';
import { Inter, Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  subsets: ['latin'],
});

// This layout has no dynamic params, so it never remounts on client-side
// navigation. The next-themes ThemeProvider must live here: it renders an
// inline theme-init <script>, and React 19 warns whenever a <script> is
// re-rendered on the client — which happens to everything inside [lang]
// when the locale changes. RootProvider (in app/[lang]/layout.tsx) detects
// this outer theme context and skips its own.
// The lang attribute defaults to the primary locale; app/[lang]/layout.tsx
// syncs it to the active locale on the client.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn(inter.className, 'font-sans', geist.variable)}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
