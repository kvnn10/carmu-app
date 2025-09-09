import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

import { isApiTokenValid } from './modules/auth/utils';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname, origin } = req.nextUrl;

    const isAuthenticated = !!token;
    const isAuthPage = ['/auth/signin', '/auth/signup'].includes(pathname);

    // Si el usuario ya está logueado y entra a signin/signup → redirige al home
    if (isAuthPage && isAuthenticated) {
      return NextResponse.redirect(`${origin}/`);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const isAuthenticated = !!token;
        const isAuthPage = ['/auth/signin', '/auth/signup'].includes(pathname);

        // 🔑 Deja pasar siempre al home
        if (pathname === '/') return true;

        // Para signin/signup → solo si NO está autenticado
        if (isAuthPage) return !isAuthenticated;

        // Para todo lo demás → requiere login + token válido
        return isAuthenticated && isApiTokenValid(token.accessToken as string);
      },
    },
    pages: {
      signIn: '/auth/signin',
      newUser: '/auth/signup',
    },
  },
);

export const config = {
  matcher: [
    '/auth/signin',
    '/auth/signup',
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)'
  ],
};
