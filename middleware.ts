import { NextResponse, type NextRequest } from 'next/server';

const norm = (s?: string) => (s ? '/' + s.replace(/^\/+|\/+$/g, '') : '');

/**
 * Secret slugs map to internal routes via rewrite. The internal routes (/hq-a, /hq-s) are
 * blocked when requested directly, so there is no /admin and nothing to discover.
 */
export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname.replace(/\/+$/, '') || '/';
  const admin = norm(process.env.ADMIN_PATH);
  const screen = norm(process.env.SCREEN_PATH);
  let res: NextResponse;

  if (admin && p === admin) {
    const url = req.nextUrl.clone();
    url.pathname = '/hq-a';
    res = NextResponse.rewrite(url);
  } else if (screen && p === screen) {
    const url = req.nextUrl.clone();
    url.pathname = '/hq-s';
    res = NextResponse.rewrite(url);
  } else if (p === '/hq-a' || p === '/hq-s' || p.startsWith('/hq-a/') || p.startsWith('/hq-s/')) {
    const url = req.nextUrl.clone();
    url.pathname = '/__nope';
    res = NextResponse.rewrite(url);
  } else {
    res = NextResponse.next();
  }
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|brand/|favicon.ico).*)'],
};
