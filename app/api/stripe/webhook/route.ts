import Stripe from "stripe";
import { stripeClient } from "@/lib/payments";
import { serviceDatabase } from "@/lib/supabase/service";
import { result } from "@/lib/http";
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature"),
    secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret)
    return result({ error: "Webhook unavailable." }, 400);
  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return result({ error: "Invalid signature." }, 400);
  }
  if (event.type !== "checkout.session.completed")
    return result({ received: true });
  const session = event.data.object;
  if (session.payment_status !== "paid" || !session.metadata?.booking_id)
    return result({ received: true });
  try {
    const { error } = await serviceDatabase().rpc("record_payment", {
      p_event: event.id,
      p_booking: session.metadata.booking_id,
      p_checkout: session.id,
      p_amount: session.amount_total,
      p_currency: session.currency,
      p_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? ""),
    });
    return error
      ? result({ error: "Reconciliation required." }, 409)
      : result({ received: true });
  } catch {
    return result({ error: "Retry delivery." }, 503);
  }
}
