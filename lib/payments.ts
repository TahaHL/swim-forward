import Stripe from "stripe";
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw Error("Payments are not configured");
  if (
    key.startsWith("sk_live_") &&
    process.env.LIVE_PAYMENTS_ENABLED !== "true"
  )
    throw Error("Live payments are disabled");
  return new Stripe(key, { maxNetworkRetries: 2 });
}
