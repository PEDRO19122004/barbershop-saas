import Link from "next/link"
import { Check } from "lucide-react"

export const metadata = {
  title: "Preços | BarberSaaS",
  description:
    "Plano único, sem surpresas. R$ 49/mês com 14 dias de teste grátis. Sem fidelidade, sem taxa de setup.",
}

const features = [
  "Agendamentos ilimitados",
  "Página pública personalizada da barbearia",
  "Múltiplos barbeiros (sem limite)",
  "Múltiplos serviços (sem limite)",
  "Bloqueio automático de horários conflitantes",
  "Dashboard com métricas em tempo real",
  "Acesso pelo celular (responsivo)",
  "Suporte por e-mail",
  "Atualizações contínuas sem custo extra",
]

const faqs = [
  {
    q: "Como funciona o teste grátis?",
    a: "Você tem 14 dias para usar todas as funcionalidades sem pagar nada. Não pedimos cartão de crédito no cadastro. Se gostar, você cadastra o cartão e continua. Se não, basta não cadastrar — sua conta entra em standby sem cobrança.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem fidelidade, sem multa. Você cancela no dashboard com 2 cliques e mantém acesso até o final do período já pago.",
  },
  {
    q: "Tem taxa de setup ou instalação?",
    a: "Não. Zero. Você se cadastra, configura sua barbearia em 3 minutos e já está rodando.",
  },
  {
    q: "Preciso instalar algum aplicativo?",
    a: "Não. Tudo roda no navegador, tanto pra você quanto pros seus clientes. Funciona em celular, tablet e computador.",
  },
  {
    q: "E se eu tiver mais de uma barbearia?",
    a: "Hoje cada conta gerencia uma barbearia. Se precisar gerenciar mais de uma unidade, fala com a gente que adaptamos.",
  },
  {
    q: "Como recebo os pagamentos dos meus clientes?",
    a: "Atualmente o sistema gerencia agendamentos. Os pagamentos físicos continuam direto com você. Integração de pagamento online dos clientes está no roadmap.",
  },
]

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
        {/* Header */}
        <div className="text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Preços
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simples e sem surpresas
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
            Um plano único com tudo incluso. Sem taxa de setup, sem fidelidade,
            sem letras miúdas.
          </p>
        </div>

        {/* Plan card */}
        <div className="mx-auto mt-16 max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Plano Profissional</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tudo que sua barbearia precisa pra organizar a agenda
              </p>
            </div>

            <div className="mt-6 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold tracking-tight">R$ 49</span>
              <span className="text-muted-foreground">/mês</span>
            </div>

            <p className="mt-2 text-center text-sm font-medium text-primary">
              14 dias grátis · sem cartão de crédito
            </p>

            <Link
              href="/cadastrar"
              className="mt-8 flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Começar grátis
            </Link>

            <ul className="mt-8 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Cancele a qualquer momento. Sem perguntas.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Perguntas frequentes
          </h2>
          <div className="mt-10 space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-semibold">Pronto pra começar?</h3>
          <p className="mt-2 text-muted-foreground">
            Configure sua barbearia em menos de 5 minutos.
          </p>
          <Link
            href="/cadastrar"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>
    </div>
  )
}