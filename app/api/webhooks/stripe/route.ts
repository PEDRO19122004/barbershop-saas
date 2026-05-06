import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import type { SubscriptionStatus } from "@prisma/client"

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE"
    case "past_due":
    case "unpaid":
      return "PAST_DUE"
    case "canceled":
    case "incomplete_expired":
      return "CANCELED"
    case "trialing":
      return "TRIALING"
    case "incomplete":
      return "INCOMPLETE"
    default:
      return "INCOMPLETE"
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, WEBHOOK_SECRET)
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripePriceId: stripeSub.items.data[0]?.price.id,
            status: "ACTIVE",
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object
        const customerId = sub.customer as string

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            status: mapStripeStatus(sub.status),
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        })
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object
        const customerId = sub.customer as string

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: "CANCELED",
            cancelAtPeriodEnd: false,
          },
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object
        const customerId = invoice.customer as string

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "PAST_DUE" },
        })
        break
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    return Response.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return Response.json({ received: true })
}
