import NextAuth, { DefaultSession } from 'next-auth';
import AzureAD from 'next-auth/providers/azure-ad';

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
          scope: 'openid profile email User.Read',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // Persistir o access_token no token JWT na primeira autenticação
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      
      // Adicionar informações do perfil do Azure AD
      if (profile) {
        token.email = profile.email;
        token.name = profile.name;
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
