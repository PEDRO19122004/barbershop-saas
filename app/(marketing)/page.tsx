import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Calendar, CreditCard, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <>
      <section className="flex flex-col items-center text-center py-24 md:py-32 px-4">
        <Badge
          variant="outline"
          className="mb-6 border-border text-foreground/80 px-3 py-1 h-auto text-sm"
        >
          Novo — SaaS para barbearias
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl">
          Agende em segundos.{" "}
          <span className="text-muted-foreground">Lotado todo dia.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
          A plataforma de agendamento que sua barbearia precisava. Clientes
          agendam sozinhos, você foca no corte.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="/cadastrar">Começar grátis</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            asChild
          >
            <Link href="/precos">Ver preços</Link>
          </Button>
        </div>
      </section>

      <section className="px-4 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl grid gap-6 md:grid-cols-3">
          <Card className="bg-card border-border ring-zinc-800">
            <CardHeader>
              <Calendar className="size-8 text-foreground mb-3" />
              <CardTitle className="text-foreground text-lg">
                Agenda inteligente
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                Sem conflitos de horário. A agenda se organiza sozinha,
                bloqueando slots já ocupados automaticamente.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border ring-zinc-800">
            <CardHeader>
              <CreditCard className="size-8 text-foreground mb-3" />
              <CardTitle className="text-foreground text-lg">
                Pagamento automático
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                Cobrança online integrada ao Stripe. Receba antes do corte e
                elimine faltas sem aviso.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border ring-zinc-800">
            <CardHeader>
              <BarChart3 className="size-8 text-foreground mb-3" />
              <CardTitle className="text-foreground text-lg">
                Dashboard completo
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                Acompanhe métricas, faturamento e histórico de clientes em
                tempo real. Tudo em um só lugar.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </>
  )
}
