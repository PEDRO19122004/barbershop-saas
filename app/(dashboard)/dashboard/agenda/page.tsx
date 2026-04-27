import { AgendaClient } from "./AgendaClient"
import {
  listAppointmentsForDashboard,
  getDashboardMetrics,
} from "@/server/actions/dashboard-appointments"

type Filter = "today" | "week" | "month" | "all"

const VALID_FILTERS: Filter[] = ["today", "week", "month", "all"]

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter: rawFilter } = await searchParams
  const currentFilter: Filter =
    VALID_FILTERS.includes(rawFilter as Filter) ? (rawFilter as Filter) : "week"

  const [appointments, metrics] = await Promise.all([
    listAppointmentsForDashboard(currentFilter),
    getDashboardMetrics(),
  ])

  return (
    <AgendaClient
      appointments={appointments}
      metrics={metrics}
      currentFilter={currentFilter}
    />
  )
}
