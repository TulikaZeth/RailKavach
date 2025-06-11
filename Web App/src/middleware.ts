import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supportedLanguages } from './lib/translation';

const locales = supportedLanguages.map(lang => lang.code);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the default locale is in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to default locale if no locale is present
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
  request.nextUrl.pathname = `/${locale}${pathname}`;
  
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, images, etc.)
    '/((?!_next|images|api|favicon.ico).*)',
  ],
};