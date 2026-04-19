import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { getStripe } from '@/lib/stripe';
import { isValidTopUpAmount, MIN_TOPUP_USD, MAX_TOPUP_USD } from '@/lib/topup-config';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const amountUsd = Number(body.amountUsd);
  if (!isValidTopUpAmount(amountUsd)) {
    return NextResponse.json(
      { success: false, error: `amountUsd must be between ${MIN_TOPUP_USD} and ${MAX_TOPUP_USD}` },
      { status: 400 },
    );
  }

  const origin = request.nextUrl.origin;
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amountUsd * 100),
          product_data: {
            name: 'ShipWithAI credits',
            description: `$${amountUsd.toFixed(2)} added to your balance`,
          },
        },
        quantity: 1,
      },
    ],
    // Metadata rides on both the Checkout Session and the PaymentIntent so the
    // callback route (session retrieve) and webhook handler (intent event) can
    // both reach it.
    metadata: { userId: user.id, amountUsd: String(amountUsd) },
    payment_intent_data: {
      metadata: { userId: user.id, amountUsd: String(amountUsd) },
    },
    success_url: `${origin}/api/topup/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard?topup=cancel`,
    customer_email: user.email ?? undefined,
  });

  if (!session.url) {
    return NextResponse.json({ success: false, error: 'Stripe did not return a URL' }, { status: 502 });
  }

  return NextResponse.json({ success: true, url: session.url });
}
