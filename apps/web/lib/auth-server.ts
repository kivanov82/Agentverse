import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

/**
 * Read the signed-in user from the NextAuth session. Returns `null` if the
 * request is unauthenticated — callers decide whether to 401 or fall through.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const shipUserId = session?.user?.shipUserId;
  if (!shipUserId) return null;
  return {
    id: shipUserId,
    email: session?.user?.email,
    name: session?.user?.name,
    image: session?.user?.image,
  };
}
