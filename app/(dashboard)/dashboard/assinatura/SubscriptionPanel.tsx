"use client"

import { useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Check, AlertTriangle, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  createCheckoutSessionAction,
  createBillingPortalSessionAction,
} from "@/server/actions/stripe"
import type { Subscription } from "@prisma/client"

type Props = {
  subscription: Subscription | null
  successFlag: boolean
  canceledFlag: boolean
}

const features = [
  "Agendamentos ilimitados",
  "Múltiplos barbeiros",
  "Painel administrativo completo",
  "Página pública personalizada",
  "Notificações por e-mail",
  "Suporte por e-mail",
]

function formatDate(date: Date | null | undefined) {
  if (!date) return "—"
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
}

export function SubscriptionPanel({ subscription, successFlag, canceledFlag }: Props) {
  const router = useRouter()
  const [isPendingCheckout, startCheckout] = useTransition()
  const [isPendingPortal, startPortal] = useTransition()

  useEffect(() => {
    if (successFlag) toast.success("Assinatura ativada com sucesso! 🎉")
    if (canceledFlag)
      toast.info("Você cancelou o checkout. Pode tentar novamente quando quiser.")
  }, [successFlag, canceledFlag])

  const status = subscription?.status

  async function handleCheckout() {
    startCheckout(async () => {
      try {
        await createCheckoutSessionAction()
      } catch {
        toast.error("Erro ao iniciar checkout. Tente novamente.")
      }
    })
  }

  async function handlePortal() {
    startPortal(async () => {
      try {
        await createBillingPortalSessionAction()
      } catch {
        toast.error("Erro ao abrir portal de cobrança. Tente novamente.")
      }
    })
  }

  return (
    <div className="container max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Assinatura</h1>
        <p className="mt-1 text-muted-foreground">Gerencie seu plano e método de pagamento</p>
      </div>

      {status === "PAST_DUE" && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-yellow-400" />
          <p className="text-sm text-yellow-300">
            Seu último pagamento falhou. Atualize seu método de pagamento para continuar usando o
            sistema.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-8">
        {(status === "ACTIVE" || status === "PAST_DUE") && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                {status === "ACTIVE" ? (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15">
                    Plano Ativo
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/15">
                    Pagamento pendente
                  </Badge>
                )}
                <h2 className="text-xl font-semibold text-foreground">Plano Mensal</h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">R$ 49,00</p>
                <p className="text-sm text-muted-foreground">/ mês</p>
              </div>
            </div>

            <ul className="mt-6 space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check size={15} className="shrink-0 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>

            {subscription?.currentPeriodEnd && status === "ACTIVE" && (
              <p className="mt-6 text-sm text-muted-foreground">
                Próxima cobrança em{" "}
                <span className="text-foreground">{formatDate(subscription.currentPeriodEnd)}</span>
              </p>
            )}

            {subscription?.cancelAtPeriodEnd && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-yellow-400" />
                <p className="text-sm text-yellow-300">
                  Sua assinatura será cancelada em{" "}
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            )}

            <div className="mt-8">
              <Button
                variant="outline"
                onClick={handlePortal}
                disabled={isPendingPortal}
                className="border-border"
              >
                {isPendingPortal ? (
                  <Loader2 size={15} className="mr-2 animate-spin" />
                ) : (
                  <CreditCard size={15} className="mr-2" />
                )}
                Gerenciar assinatura
              </Button>
            </div>
          </>
        )}

        {status === "TRIALING" && (
          <>
            <div className="space-y-1">
              <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/15">
                Período de teste
              </Badge>
              <h2 className="text-xl font-semibold text-foreground">Plano Mensal</h2>
              <p className="text-sm text-muted-foreground">
                Você está no período de teste gratuito.
                {subscription?.currentPeriodEnd && (
                  <> Trial expira em{" "}
                    <span className="text-foreground">{formatDate(subscription.currentPeriodEnd)}</span>
                  </>
                )}
              </p>
            </div>

            <ul className="mt-6 space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check size={15} className="shrink-0 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={isPendingCheckout}
                className="bg-white text-zinc-950 hover:bg-zinc-100"
              >
                {isPendingCheckout && <Loader2 size={16} className="mr-2 animate-spin" />}
                Assinar agora — R$ 49/mês
              </Button>
            </div>
          </>
        )}

        {(!status || status === "CANCELED" || status === "INCOMPLETE") && (
          <>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">Plano Mensal</h2>
              <p className="text-sm text-muted-foreground">
                {status === "CANCELED"
                  ? "Sua assinatura foi cancelada."
                  : "Você não tem uma assinatura ativa."}
              </p>
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">R$ 49,00</span>
              <span className="text-sm text-muted-foreground">/ mês</span>
            </div>

            <ul className="mt-6 space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check size={15} className="shrink-0 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={isPendingCheckout}
                className="bg-white text-zinc-950 hover:bg-zinc-100"
              >
                {isPendingCheckout && <Loader2 size={16} className="mr-2 animate-spin" />}
                Assinar agora — R$ 49/mês
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
