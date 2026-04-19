import Stripe from 'stripe';
import { getFirestoreStore } from '@shipwithai/core/firestore-store';
import { centsToUsd } from './topup-config';

let instance: Stripe | null = null;

export function getStripe(): Stripe {
  if (instance) return instance;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  instance = new Stripe(key);
  return instance;
}

export interface ApplyStripeSessionResult {
  applied: boolean;
  balance: number;
  userId: string;
  amountUsd: number;
  paymentIntentId: string;
}

/**
 * Credit a user for a paid Stripe Checkout session. Uses `amount_total`
 * (Stripe's authoritative settled amount in cents) rather than the metadata
 * we wrote at session creation, so coupon/FX/proration edge cases can't
 * diverge credit from charge. Idempotent via `creditTopUp`'s doc-ID dedup —
 * callback + webhook both safely call this.
 *
 * Returns `null` if the session is not paid or is missing required fields.
 */
export async function applyStripeSession(
  session: Stripe.Checkout.Session,
): Promise<ApplyStripeSessionResult | null> {
  if (session.payment_status !== 'paid') return null;
  if (session.currency !== 'usd') return null;

  const userId = session.metadata?.userId;
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;
  const amountCents = session.amount_total ?? 0;

  if (!userId || !paymentIntentId || amountCents <= 0) return null;

  const amountUsd = centsToUsd(amountCents);
  const externalRef = `stripe_${paymentIntentId}`;
  const externalUrl = `https://dashboard.stripe.com/payments/${paymentIntentId}`;

  const result = await getFirestoreStore().creditTopUp(
    userId,
    amountUsd,
    'stripe',
    externalRef,
    externalUrl,
  );

  return { ...result, userId, amountUsd, paymentIntentId };
}
