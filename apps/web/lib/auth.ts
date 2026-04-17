import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';
import { getFirestoreStore } from '@shipwithai/core/firestore-store';
import type { IdentityProvider } from '@shipwithai/core/firestore-store';

// Starter credit granted on first sign-up ($USD). Single source of truth — bump
// here if promo changes. Applied atomically inside getOrCreateUserByIdentity.
export const STARTER_CREDIT_USD = 5;

// JWT session strategy — NextAuth's Firestore adapter is unofficial, so we
// carry our own userId on the token and look up the User row from Firestore
// ourselves. The signIn callback materialises the User + grants starter credit.
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    // Google — only registered if env vars are set so local dev without
    // OAuth credentials can still build. SIWE works standalone.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'siwe',
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials.signature) return null;
        try {
          const siwe = new SiweMessage(JSON.parse(credentials.message as string));
          const result = await siwe.verify({ signature: credentials.signature as string });
          if (!result.success) return null;
          const address = result.data.address.toLowerCase();
          return { id: address, name: address, email: `${address}@wallet.local` };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;
      const store = getFirestoreStore();
      const provider = providerOf(account.provider);
      if (!provider) return false;

      // Google uses the stable `sub`, SIWE uses the wallet address we put in `user.id`.
      const providerId = account.provider === 'siwe'
        ? (user.id ?? '').toLowerCase()
        : (account.providerAccountId ?? '');
      if (!providerId) return false;

      const record = await store.getOrCreateUserByIdentity(
        provider,
        providerId,
        {
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          walletAddress: provider === 'siwe' ? providerId : undefined,
        },
        STARTER_CREDIT_USD,
      );

      // Stash our internal userId on the user object so the jwt callback can read it.
      (user as { shipUserId?: string }).shipUserId = record.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as { shipUserId?: string };
        if (u.shipUserId) token.shipUserId = u.shipUserId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.shipUserId && session.user) {
        (session.user as { shipUserId?: string }).shipUserId = token.shipUserId as string;
      }
      return session;
    },
  },
};

function providerOf(raw: string | undefined): IdentityProvider | null {
  if (raw === 'google') return 'google';
  if (raw === 'siwe') return 'siwe';
  return null;
}
