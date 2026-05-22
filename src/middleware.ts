import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  if (host.includes('jstipku.vercel.app') || host.includes('richolis-projects-a076068c.vercel.app')) {
    const newUrl = new URL(request.nextUrl.pathname, 'https://jstipku.online');
    newUrl.search = request.nextUrl.search;
    return NextResponse.redirect(newUrl, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
