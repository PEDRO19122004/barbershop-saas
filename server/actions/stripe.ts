"use server"

import { redirect } from "next/navigation"
import { stripe, STRIPE_PRICE_ID, APP_URL } from "@/lib/stripe"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/session"

export async function createCheckoutSessionAction() {
  const user = await requireAuth()

  let subscription = await db.subscription.findUnique({
    where: { userId: user.id! },
  })

  let stripeCustomerId = subscription?.stripeCustomerId

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: user.name ?? undefined,
      metadata: { userId: user.id! },
    })
    stripeCustomerId = customer.id

    await db.subscription.upsert({
      where: { userId: user.id! },
      create: {
        userId: user.id!,
        stripeCustomerId,
        status: "TRIALING",
      },
      update: { stripeCustomerId },
    })
  }

  const barbershop = await db.barbershop.findUnique({
    where: { userId: user.id! },
  })

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: stripeCustomerId,
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/dashboard/assinatura?success=true`,
    cancel_url: `${APP_URL}/dashboard/assinatura?canceled=true`,
    metadata: {
      userId: user.id!,
      barbershopId: barbershop?.id ?? "",
    },
    locale: "pt-BR",
  })

  redirect(session.url!)
}

export async function createBillingPortalSessionAction() {
  const user = await requireAuth()

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id! },
  })

  if (!subscription?.stripeCustomerId) {
    throw new Error("Nenhuma assinatura encontrada.")
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${APP_URL}/dashboard/assinatura`,
  })

  redirect(portalSession.url)
}

export async function getSubscriptionStatus() {
  const user = await requireAuth()

  return db.subscription.findUnique({
    where: { userId: user.id! },
  })
}
