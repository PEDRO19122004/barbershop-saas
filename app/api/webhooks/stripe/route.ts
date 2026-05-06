import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Mapeia status do Stripe pro nosso enum
function mapStripeStatus(
  stripeStatus: string
): "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "INCOMPLETE" {
  switch (stripeStatus) {
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "trialing":
      return "TRIALING";
    case "incomplete":
      return "INCOMPLETE";
    case "incomplete_expired":
      return "CANCELED";
    case "unpaid":
      return "PAST_DUE";
    default:
      return "INCOMPLETE";
  }
}

export async function POST(req: NextRequest) {
  // Pega o body como texto puro (CRÍTICO pro Stripe validar)
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ Webhook sem signature");
    return NextResponse.json(
      { error: "Sem signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error("❌ Erro de validação do webhook:", error.message);
    return NextResponse.json(
      { error: `Webhook inválido: ${error.message}` },
      { status: 400 }
    );
  }

  console.log(`✅ Webhook recebido: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!subscriptionId || !customerId) {
          console.log("Session sem subscription ou customer, ignorando");
          break;
        }

        // Busca a subscription completa no Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Atualiza o banco
        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(
              (subscription as any).current_period_start * 1000
            ),
            currentPeriodEnd: new Date(
              (subscription as any).current_period_end * 1000
            ),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        console.log(`✅ Subscription ${subscription.id} ativada no banco`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        await db.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(
              (subscription as any).current_period_start * 1000
            ),
            currentPeriodEnd: new Date(
              (subscription as any).current_period_end * 1000
            ),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        console.log(`✅ Subscription ${subscription.id} atualizada`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await db.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: "CANCELED",
            cancelAtPeriodEnd: false,
          },
        });

        console.log(`✅ Subscription ${subscription.id} cancelada`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          await db.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: "PAST_DUE" },
          });
          console.log(`⚠️ Subscription ${subscriptionId} com pagamento atrasado`);
        }
        break;
      }

      default:
        console.log(`Evento ignorado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error("❌ Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: `Erro: ${error.message}` },
      { status: 500 }
    );
  }
}