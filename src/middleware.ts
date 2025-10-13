import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware permite acesso sem login
// A autenticação é opcional e controlada pelo Azure AD externamente
export function middleware(request: NextRequest) {
  // Permite acesso a todas as rotas sem verificação de autenticação
  return NextResponse.next();
}

// Configuração: aplica a todas as rotas exceto arquivos estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
