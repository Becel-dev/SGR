import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      email: string;
      name: string;
    } & DefaultSession['user'];
    accessToken?: string;
  }

  interface JWT {
    accessToken?: string;
    idToken?: string;
  }
}
