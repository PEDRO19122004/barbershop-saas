import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireAuth, requireBarbershop } from "@/lib/session"
import { db } from "@/lib/db"
import {
  getDashboardMetrics,
  getUpcomingAppointments,
} from "@/server/actions/dashboard-appointments"
import { formatCurrency } from "@/lib/format"

export default async function DashboardOverviewPage() {
  const user = await requireAuth()
  const barbershop = await requireBarbershop()

  const firstName = user.name?.split(" ")[0] ?? "Usuário"

  const [metrics, upcoming, servicesCount, barbersCount] = await Promise.all([
    getDashboardMetrics(),
    getUpcomingAppointments(5),
    db.service.count({ where: { barbershopId: barbershop.id, isActive: true } }),
    db.barber.count({ where: { barbershopId: barbershop.id, isActive: true } }),
  ])

  const steps = [
    {
      label: "Cadastrar seus serviços",
      href: "/dashboard/servicos",
      done: servicesCount > 0,
    },
    {
      label: "Adicionar barbeiros da equipe",
      href: "/dashboard/barbeiros",
      done: barbersCount > 0,
    },
    {
      label: "Configurar horário de funcionamento",
      href: "/dashboard/horarios",
      done: metrics.totalUpcoming > 0,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Olá, {firstName}! 👋
        </h1>
        <p className="mt-1 text-zinc-400">
          Bem-vindo ao seu painel. Por aqui você gerencia tudo.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Próximos agendamentos
            </CardTitle>
            <Calendar className="h-5 w-5 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{metrics.totalUpcoming}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Hoje
            </CardTitle>
            <Clock className="h-5 w-5 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{metrics.todayCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Faturamento da semana
            </CardTitle>
            <DollarSign className="h-5 w-5 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(metrics.weekRevenueInCents)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total realizados
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{metrics.completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming appointments */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-white">
            Próximos 5 agendamentos
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            <Link href="/dashboard/agenda">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-6">
              Nenhum agendamento futuro
            </p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {upcoming.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium text-white text-sm">
                      {appt.customer.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {format(new Date(appt.startTime), "dd/MM/yyyy", { locale: ptBR })}
                      {" · "}
                      {format(new Date(appt.startTime), "HH:mm")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">{appt.service.name}</span>
                    <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/10">
                      Confirmado
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Getting started */}
      <Card className="bg-zinc-900 border-zinc-800">
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
