import Link from "next/link"
import { Scissors, Users, Calendar, CheckCircle2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuth, requireBarbershop } from "@/lib/session"
import { db } from "@/lib/db"

export default async function DashboardOverviewPage() {
  const user = await requireAuth()
  const barbershop = await requireBarbershop()

  const firstName = user.name?.split(" ")[0] ?? "Usuário"

  const [servicesCount, barbersCount, appointmentsCount] = await Promise.all([
    db.service.count({ where: { barbershopId: barbershop.id, isActive: true } }),
    db.barber.count({ where: { barbershopId: barbershop.id, isActive: true } }),
    db.appointment.count({
      where: {
        barbershopId: barbershop.id,
        startTime: { gte: new Date() },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
  ])

  const stepsComplete = [
    servicesCount > 0,
    barbersCount > 0,
    appointmentsCount > 0,
  ]

  const steps = [
    {
      label: "Cadastrar seus serviços",
      href: "/dashboard/servicos",
      done: stepsComplete[0],
    },
    {
      label: "Adicionar barbeiros da equipe",
      href: "/dashboard/barbeiros",
      done: stepsComplete[1],
    },
    {
      label: "Configurar horário de funcionamento",
      href: "/dashboard/horarios",
      done: stepsComplete[2],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Olá, {firstName}! 👋
        </h1>
        <p className="mt-1 text-zinc-400">
          Bem-vindo ao seu painel. Por aqui você gerencia tudo.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-zinc-900 border-zinc-800 ring-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Serviços ativos
            </CardTitle>
            <Scissors className="h-5 w-5 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{servicesCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 ring-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Barbeiros na equipe
            </CardTitle>
            <Users className="h-5 w-5 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{barbersCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 ring-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Agendamentos futuros
            </CardTitle>
            <Calendar className="h-5 w-5 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{appointmentsCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Getting started */}
      <Card className="bg-zinc-900 border-zinc-800 ring-zinc-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">
            Primeiros passos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-800"
            >
              {step.done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              ) : (
                <div className="h-5 w-5 shrink-0 rounded border border-zinc-700" />
              )}
              <span
                className={
                  step.done
                    ? "flex-1 text-sm text-zinc-500 line-through"
                    : "flex-1 text-sm text-zinc-300"
                }
              >
                {step.label}
              </span>
              {!step.done && (
                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
