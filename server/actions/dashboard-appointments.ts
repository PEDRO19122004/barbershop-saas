"use server"

import { revalidatePath } from "next/cache"
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { db } from "@/lib/db"
import { requireBarbershop } from "@/lib/session"

type AppointmentFilter = "today" | "week" | "month" | "all"

function buildDateFilter(filter: AppointmentFilter) {
  const now = new Date()
  if (filter === "today") {
    return { gte: startOfDay(now), lte: endOfDay(now) }
  }
  if (filter === "week") {
    return {
      gte: startOfWeek(now, { locale: ptBR }),
      lte: endOfWeek(now, { locale: ptBR }),
    }
  }
  if (filter === "month") {
    return { gte: startOfMonth(now), lte: endOfMonth(now) }
  }
  return undefined
}

export async function listAppointmentsForDashboard(filter: AppointmentFilter) {
  const barbershop = await requireBarbershop()
  const dateFilter = buildDateFilter(filter)

  return db.appointment.findMany({
    where: {
      barbershopId: barbershop.id,
      ...(dateFilter ? { startTime: dateFilter } : {}),
    },
    include: {
      service: true,
      barber: true,
      customer: true,
    },
    orderBy: { startTime: "asc" },
  })
}

export async function updateAppointmentStatusAction(
  id: string,
  status: "COMPLETED" | "CANCELLED" | "NO_SHOW" | "CONFIRMED"
): Promise<{ success: true } | { error: string }> {
  const barbershop = await requireBarbershop()

  const appointment = await db.appointment.findFirst({
    where: { id, barbershopId: barbershop.id },
  })

  if (!appointment) {
    return { error: "Agendamento não encontrado." }
  }

  await db.appointment.update({
    where: { id },
    data: { status },
  })

  revalidatePath("/dashboard/agenda")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function getDashboardMetrics() {
  const barbershop = await requireBarbershop()
  const now = new Date()

  const [totalUpcoming, todayCount, weekRevenue, completedCount, cancelledCount] =
    await Promise.all([
      db.appointment.count({
        where: {
          barbershopId: barbershop.id,
          status: "CONFIRMED",
          startTime: { gte: now },
        },
      }),
      db.appointment.count({
        where: {
          barbershopId: barbershop.id,
          startTime: { gte: startOfDay(now), lte: endOfDay(now) },
        },
      }),
      db.appointment.aggregate({
        where: {
          barbershopId: barbershop.id,
          status: "COMPLETED",
          startTime: {
            gte: startOfWeek(now, { locale: ptBR }),
            lte: endOfWeek(now, { locale: ptBR }),
          },
        },
        _sum: { priceInCents: true },
      }),
      db.appointment.count({
        where: { barbershopId: barbershop.id, status: "COMPLETED" },
      }),
      db.appointment.count({
        where: {
          barbershopId: barbershop.id,
          status: { in: ["CANCELLED", "NO_SHOW"] },
        },
      }),
    ])

  return {
    totalUpcoming,
    todayCount,
    weekRevenueInCents: weekRevenue._sum.priceInCents ?? 0,
    completedCount,
    cancelledCount,
  }
}

export async function getUpcomingAppointments(limit = 5) {
  const barbershop = await requireBarbershop()
  return db.appointment.findMany({
    where: {
      barbershopId: barbershop.id,
      status: "CONFIRMED",
      startTime: { gte: new Date() },
    },
    include: { customer: true, service: true },
    orderBy: { startTime: "asc" },
    take: limit,
  })
}
