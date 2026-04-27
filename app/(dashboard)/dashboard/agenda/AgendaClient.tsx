"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Calendar,
  Clock,
  DollarSign,
  XCircle,
  MoreHorizontal,
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateAppointmentStatusAction } from "@/server/actions/dashboard-appointments"
import { formatCurrency } from "@/lib/format"

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"

interface Appointment {
  id: string
  startTime: Date
  status: AppointmentStatus
  priceInCents: number
  customer: { name: string; phone: string }
  service: { name: string }
  barber: { name: string }
}

interface Metrics {
  totalUpcoming: number
  todayCount: number
  weekRevenueInCents: number
  cancelledCount: number
}

type Filter = "today" | "week" | "month" | "all"

interface Props {
  appointments: Appointment[]
  metrics: Metrics
  currentFilter: Filter
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
  PENDING: "Pendente",
}

const STATUS_CLASSES: Record<AppointmentStatus, string> = {
  CONFIRMED:
    "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/10",
  COMPLETED:
    "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/10",
  CANCELLED:
    "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 hover:bg-zinc-500/10",
  NO_SHOW:
    "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/10",
  PENDING:
    "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/10",
}

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
  { value: "all", label: "Todos" },
]

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  sublabel?: string
  value: string | number
  icon: React.ElementType
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
      </div>
      <Icon className="text-zinc-600" size={20} />
    </div>
  )
}

export function AgendaClient({ appointments, metrics, currentFilter }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cancelId, setCancelId] = useState<string | null>(null)

  function handleFilterChange(filter: Filter) {
    router.push(`/dashboard/agenda?filter=${filter}`)
  }

  function handleStatusChange(id: string, status: "COMPLETED" | "NO_SHOW" | "CONFIRMED") {
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(id, status)
      if ("error" in result) {
        toast.error(result.error)
      } else {
        toast.success("Status atualizado com sucesso.")
      }
    })
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(id, "CANCELLED")
      if ("error" in result) {
        toast.error(result.error)
      } else {
        toast.success("Agendamento cancelado.")
      }
      setCancelId(null)
    })
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Agenda</h1>
        <p className="mt-1 text-zinc-400">
          Gerencie todos os agendamentos da sua barbearia
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <MetricCard
          label="Próximos agendamentos"
          value={metrics.totalUpcoming}
          icon={Calendar}
        />
        <MetricCard
          label="Hoje"
          value={metrics.todayCount}
          icon={Clock}
        />
        <MetricCard
          label="Faturamento da semana"
          value={formatCurrency(metrics.weekRevenueInCents)}
          icon={DollarSign}
        />
        <MetricCard
          label="Cancelados + No-shows"
          value={metrics.cancelledCount}
          icon={XCircle}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mt-8 mb-4">
        {FILTER_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange(opt.value)}
            className={
              currentFilter === opt.value
                ? "bg-white text-zinc-950 hover:bg-zinc-100 border-white"
                : ""
            }
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* List */}
      {appointments.length === 0 ? (
        <Card className="border-dashed border-zinc-700 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="text-zinc-700 mb-4" size={40} />
            <p className="text-zinc-300 font-medium">
              Nenhum agendamento neste período
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              Os agendamentos vão aparecer aqui conforme os clientes forem marcando.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Data</TableHead>
                <TableHead className="text-zinc-400">Horário</TableHead>
                <TableHead className="text-zinc-400">Cliente</TableHead>
                <TableHead className="text-zinc-400">Serviço</TableHead>
                <TableHead className="text-zinc-400">Profissional</TableHead>
                <TableHead className="text-zinc-400">Valor</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow
                  key={appt.id}
                  className="border-zinc-800 hover:bg-zinc-900/50"
                >
                  <TableCell>
                    <p className="text-white text-sm">
                      {format(new Date(appt.startTime), "dd/MM/yyyy")}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {capitalize(
                        format(new Date(appt.startTime), "EEEE", { locale: ptBR })
                      )}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-white text-sm">
                      {format(new Date(appt.startTime), "HH:mm")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-white text-sm">
                      {appt.customer.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {appt.customer.phone}
                    </p>
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {appt.service.name}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {appt.barber.name}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {formatCurrency(appt.priceInCents)}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_CLASSES[appt.status]}>
                      {STATUS_LABELS[appt.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white"
                          disabled={isPending}
                        >
                          <MoreHorizontal size={16} />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                        {appt.status === "CONFIRMED" ? (
                          <>
                            <DropdownMenuItem
                              className="text-zinc-300 hover:text-white focus:text-white cursor-pointer"
                              onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                            >
                              Marcar como concluído
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-zinc-300 hover:text-white focus:text-white cursor-pointer"
                              onClick={() => handleStatusChange(appt.id, "NO_SHOW")}
                            >
                              Cliente não compareceu
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem
                              className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer"
                              onClick={() => setCancelId(appt.id)}
                            >
                              Cancelar agendamento
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            className="text-zinc-300 hover:text-white focus:text-white cursor-pointer"
                            onClick={() => handleStatusChange(appt.id, "CONFIRMED")}
                          >
                            Reabrir como confirmado
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelId !== null} onOpenChange={(open) => !open && setCancelId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Cancelar agendamento</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser
              desfeita facilmente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelId(null)}
              disabled={isPending}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelId && handleCancel(cancelId)}
              disabled={isPending}
            >
              {isPending ? "Cancelando..." : "Cancelar agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
