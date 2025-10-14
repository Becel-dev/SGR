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
    // Provider de teste para ambiente local
    Credentials({
      id: 'test-credentials',
      name: 'Teste Local',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'teste@exemplo.com' },
      },
      async authorize(credentials) {
        // Apenas para testes locais - NÃO usar em produção!
        if (process.env.NODE_ENV !== 'production') {
          const email = credentials?.email as string;
          
          // Lista de usuários de teste pré-definidos
          const testUsers = [
            { email: 'pedro@teste.com', name: 'Pedro Teste' },
            { email: 'maria@teste.com', name: 'Maria Silva' },
            { email: 'joao@teste.com', name: 'João Santos' },
            { email: 'ana@teste.com', name: 'Ana Costa' },
          ];
          
          // Buscar usuário na lista
          const user = testUsers.find(u => u.email === email);
          
          if (user) {
            return {
              id: `test-${user.email}`,
              email: user.email,
              name: user.name,
            };
          }
          
          // Se não encontrar, aceitar qualquer email para testes
          return {
            id: 'test-user-custom',
            email: email || 'pedro@teste.com',
            name: email ? email.split('@')[0] : 'Pedro Teste',
          };
        }
        
        return null;
      },
    }),
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
