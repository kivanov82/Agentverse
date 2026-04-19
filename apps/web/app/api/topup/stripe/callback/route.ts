import { NextRequest, NextResponse } from 'next/server';
import { getStripe, applyStripeSession } from '@/lib/stripe';

// Stripe redirects here after a successful Checkout. We retrieve the session,
// verify it's paid, and credit the user directly so the balance is live by the
// time they land back on /dashboard. The webhook is a belt-and-suspenders
// backstop for the tab-close case; idempotency (Firestore doc ID) makes the
// concurrent-arrival case safe.
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.redirect(new URL('/dashboard?topup=error', request.nextUrl.origin));
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(new URL('/dashboard?topup=pending', request.nextUrl.origin));
    }

    const result = await applyStripeSession(session);
    if (!result) {
      console.error('[stripe/callback] session rejected', { sessionId, payment_status: session.payment_status });
      return NextResponse.redirect(new URL('/dashboard?topup=error', request.nextUrl.origin));
    }
    if (!result.applied) {
      console.log('[stripe/callback] duplicate skipped', { externalRef: `stripe_${result.paymentIntentId}` });
    }

    return NextResponse.redirect(new URL('/dashboard?topup=success', request.nextUrl.origin));
  } catch (err) {
    console.error('[stripe/callback] failed', err);
    return NextResponse.redirect(new URL('/dashboard?topup=error', request.nextUrl.origin));
  }
}
