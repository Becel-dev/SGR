import NextAuth, { DefaultSession } from 'next-auth';
import AzureAD from 'next-auth/providers/azure-ad';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      email: string;
      name: string;
    } & DefaultSession['user'];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: 'openid profile email User.Read User.Read.All',
        },
      },
    }),
    // Provider de desenvolvimento (apenas ambiente local)
    ...(process.env.NODE_ENV === 'development' ? [
      Credentials({
        id: 'dev-credentials',
        name: 'Desenvolvimento Local',
        credentials: {
          email: { label: 'Email', type: 'email', placeholder: 'seu.email@exemplo.com' },
          name: { label: 'Nome', type: 'text', placeholder: 'Seu Nome' },
        },
        async authorize(credentials) {
          const email = credentials?.email as string;
          const name = credentials?.name as string;
          
          if (!email) {
            return null;
          }
          
          return {
            id: `dev-${email}`,
            email: email,
            name: name || email.split('@')[0],
          };
        },
      })
    ] : []),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }: any) {
      // Persistir o access_token no token JWT na primeira autenticação
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      
      // Adicionar informações do perfil (Azure AD ou Credentials)
      if (profile) {
        token.email = profile.email;
        token.name = profile.name;
      }
      
      // Para provider Credentials, o user vem diretamente do authorize()
      if (user && !profile) {
        token.email = user.email;
        token.name = user.name;
      }
      
      return token;
    },
    async session({ session, token }: any) {
      // Disponibilizar informações do usuário na sessão
      if (token) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.accessToken = token.accessToken as string;
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
});
