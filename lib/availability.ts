import { startOfDay, endOfDay, addMinutes, format, getDay } from "date-fns"
import { db } from "@/lib/db"

export function dayOfWeekToLabel(day: number): string {
  const labels = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ]
  return labels[day] ?? ""
}

export function formatTimeSlot(timeStr: string): string {
  return timeStr
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export async function getAvailableSlots(params: {
  barbershopId: string
  barberId: string
  serviceDurationMin: number
  date: Date
}): Promise<string[]> {
  const { barbershopId, barberId, serviceDurationMin, date } = params

  const dayOfWeek = getDay(date)

  const hours = await db.businessHours.findUnique({
    where: { barbershopId_dayOfWeek: { barbershopId, dayOfWeek } },
  })

  if (!hours || hours.isClosed) return []

  const openMinutes = parseTimeToMinutes(hours.openTime)
  const closeMinutes = parseTimeToMinutes(hours.closeTime)
  const lastSlotStart = closeMinutes - serviceDurationMin

  const candidates: string[] = []
  for (let t = openMinutes; t <= lastSlotStart; t += 15) {
    candidates.push(minutesToTimeString(t))
  }

  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  const appointments = await db.appointment.findMany({
    where: {
      barberId,
      status: { in: ["CONFIRMED", "PENDING"] },
      startTime: { gte: dayStart, lt: dayEnd },
    },
    select: { startTime: true, endTime: true },
  })

  const now = new Date()
  const isToday =
    format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")

  const available = candidates.filter((slot) => {
    const slotStartMin = parseTimeToMinutes(slot)
    const slotEndMin = slotStartMin + serviceDurationMin

    if (isToday) {
      const slotDate = addMinutes(dayStart, slotStartMin)
      if (slotDate <= now) return false
    }

    for (const appt of appointments) {
      const apptStartMin = parseTimeToMinutes(format(appt.startTime, "HH:mm"))
      const apptEndMin = parseTimeToMinutes(format(appt.endTime, "HH:mm"))
      const overlaps = slotStartMin < apptEndMin && slotEndMin > apptStartMin
      if (overlaps) return false
    }

    return true
  })

  return available
}
