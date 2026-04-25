"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireBarbershop } from "@/lib/session"

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

const businessHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(timeRegex, "Formato inválido (use HH:mm)"),
  closeTime: z.string().regex(timeRegex, "Formato inválido (use HH:mm)"),
  isClosed: z.boolean(),
})

const upsertSchema = z
  .array(businessHourSchema)
  .length(7, "Deve conter exatamente 7 dias")
  .refine(
    (days) => days.every((d) => d.isClosed || d.openTime < d.closeTime),
    "Horário de abertura deve ser antes do fechamento"
  )

export async function listBusinessHours() {
  const barbershop = await requireBarbershop()
  return db.businessHours.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: { dayOfWeek: "asc" },
  })
}

export async function upsertBusinessHours(input: unknown) {
  const barbershop = await requireBarbershop()

  const parsed = upsertSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    await db.$transaction(
      parsed.data.map((day) =>
        db.businessHours.upsert({
          where: {
            barbershopId_dayOfWeek: {
              barbershopId: barbershop.id,
              dayOfWeek: day.dayOfWeek,
            },
          },
          update: {
            openTime: day.openTime,
            closeTime: day.closeTime,
            isClosed: day.isClosed,
          },
          create: {
            barbershopId: barbershop.id,
            dayOfWeek: day.dayOfWeek,
            openTime: day.openTime,
            closeTime: day.closeTime,
            isClosed: day.isClosed,
          },
        })
      )
    )
    revalidatePath("/dashboard/horarios")
    return { success: true }
  } catch {
    return { error: "Erro ao salvar horários. Tente novamente." }
  }
}
