import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Si intentan entrar a /admin (o cualquier sub-ruta) pero NO a /admin/login
  if (path.startsWith('/admin') && path !== '/admin/login') {
    
    // Buscamos la "pulsera VIP" (la cookie)
    const token = request.cookies.get('admin_token')?.value;

    // Si no tiene la pulsera, lo mandamos a la página de login
    if (token !== 'autenticado') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Si tiene la pulsera o está navegando por el inicio, lo dejamos pasar
  return NextResponse.next();
}

// Le decimos al patovica que solo vigile la puerta de /admin
export const config = {
  matcher: ['/admin/:path*'],
};