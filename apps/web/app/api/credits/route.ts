import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreStore } from '@shipwithai/core/firestore-store';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'unauthenticated' }, { status: 401 });
  }

  const includeLedger = request.nextUrl.searchParams.get('ledger') === '1';
  const store = getFirestoreStore();
  const [record, entries] = await Promise.all([
    store.getUser(user.id),
    includeLedger ? store.listLedgerEntries(user.id, 20) : Promise.resolve(undefined),
  ]);

  return NextResponse.json({
    success: true,
    balance: record?.creditBalance ?? 0,
    starterCreditGranted: record?.starterCreditGranted ?? false,
    ...(entries ? { entries } : {}),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
  });
}
