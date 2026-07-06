import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';
import { docsContentRoute, docsRoute } from '@/lib/shared';

// markdown negotiation: /:lang/docs/... -> /:lang/llms.mdx/docs/.../content.md
// locale-less /docs/... URLs are kept working by mapping them to the default locale.
const localePrefixes = [
  ...i18n.languages.map((locale) => ({ from: `/${locale}`, to: `/${locale}` })),
  { from: '', to: `/${i18n.defaultLanguage}` },
];

const rewriteSuffix = localePrefixes.map(
  ({ from, to }) =>
    rewritePath(`${from}${docsRoute}{/*path}.md`, `${to}${docsContentRoute}{/*path}/content.md`)
      .rewrite,
);
const rewriteDocs = localePrefixes.map(
  ({ from, to }) =>
    rewritePath(`${from}${docsRoute}{/*path}`, `${to}${docsContentRoute}{/*path}/content.md`)
      .rewrite,
);

// redirects page URLs without a locale prefix (e.g. /docs/...) to the detected locale
const i18nMiddleware = createI18nMiddleware(i18n);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;

  for (const rewrite of rewriteSuffix) {
    const result = rewrite(pathname);
    if (result) return NextResponse.rewrite(new URL(result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    for (const rewrite of rewriteDocs) {
      const result = rewrite(pathname);
      if (result) return NextResponse.rewrite(new URL(result, request.nextUrl));
    }
  }

  // never locale-redirect API routes, Next internals, or file requests (/llms.txt, images, ...)
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  return i18nMiddleware(request, event);
}
