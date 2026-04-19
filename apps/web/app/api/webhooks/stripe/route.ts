import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, applyStripeSession } from '@/lib/stripe';

// Belt-and-suspenders for the callback route. If the user closes the tab
// before Stripe redirects them back, this webhook still credits the account.
// Idempotency is guaranteed by `creditTopUp`'s doc-ID dedup — duplicate
// callback+webhook calls result in a single credit.
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'webhook not configured' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed', err);
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const result = await applyStripeSession(session);
  if (!result) {
    return NextResponse.json({ received: true, skipped: 'not applicable' });
  }

  return NextResponse.json({ received: true, applied: result.applied });
}
