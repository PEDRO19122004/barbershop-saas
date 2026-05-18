"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { addMinutes } from "date-fns"
import { fromZonedTime } from "date-fns-tz"
import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { getAvailableSlots } from "@/lib/availability"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { BARBERSHOP_TIMEZONE } from "@/lib/timezone"

export async function getAvailableSlotsAction(input: {
  slug: string
  barberId: string
  serviceId: string
  dateISO: string
}): Promise<{ slots: string[] } | { error: string }> {
  const barbershop = await db.barbershop.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  })
  if (!barbershop) return { error: "Barbearia não encontrada." }

  const service = await db.service.findFirst({
    where: { id: input.serviceId, barbershopId: barbershop.id, isActive: true },
    select: { durationMin: true },
  })
  if (!service) return { error: "Serviço não encontrado ou inativo." }

  const barber = await db.barber.findFirst({
    where: { id: input.barberId, barbershopId: barbershop.id, isActive: true },
    select: { id: true },
  })
  if (!barber) return { error: "Profissional não encontrado ou inativo." }

  const slots = await getAvailableSlots({
    barbershopId: barbershop.id,
    barberId: input.barberId,
    serviceDurationMin: service.durationMin,
    dateISO: input.dateISO,
  })

  return { slots }
}

const createAppointmentSchema = z.object({
  slug: z.string().min(1).max(100),
  serviceId: z.string().min(1).max(50),
  barberId: z.string().min(1).max(50),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(120, "Nome muito longo"),
  customerPhone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 15, "Telefone inválido"),
  customerEmail: z
    .string()
    .email("E-mail inválido")
    .max(200)
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500, "Observação muito longa").optional(),
})

export async function createAppointmentAction(
  input: unknown
): Promise<{ success: true; appointmentId: string } | { error: string }> {
  // [1] Rate limit por IP: 5 tentativas / hora.
  const ip = await getClientIp()
  const rl = await checkRateLimit(`booking:${ip}`, {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000,
  })
  if (!rl.ok) {
    const mins = Math.ceil(rl.retryAfterSec / 60)
    return {
      error: `Muitas tentativas de agendamento. Tente novamente em ${mins} minuto(s).`,
    }
  }

  // [2] Validacao de input.
  const parsed = createAppointmentSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const {
    slug,
    serviceId,
    barberId,
    dateISO,
    time,
    customerName,
    customerPhone,
    customerEmail,
    notes,
  } = parsed.data

  // [3] Resolve barbearia / servico / barbeiro com ownership cruzado.
  const barbershop = await db.barbershop.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (!barbershop) return { error: "Barbearia não encontrada." }

  const service = await db.service.findFirst({
    where: { id: serviceId, barbershopId: barbershop.id, isActive: true },
  })
  if (!service) return { error: "Serviço não encontrado ou inativo." }

  const barber = await db.barber.findFirst({
    where: { id: barberId, barbershopId: barbershop.id, isActive: true },
    select: { id: true },
  })
  if (!barber) return { error: "Profissional não encontrado ou inativo." }

  // [4] Pre-check de disponibilidade.
  const availableSlots = await getAvailableSlots({
    barbershopId: barbershop.id,
    barberId,
    serviceDurationMin: service.durationMin,
    dateISO,
  })
  if (!availableSlots.includes(time)) {
    return {
      error:
        "Esse horário acabou de ser reservado por outra pessoa. Por favor escolha outro.",
    }
  }

  // [5] Calcula startTime/endTime em BRT->UTC.
  //     Sem fromZonedTime, o servidor Vercel (UTC) salvaria 3h adiantado.
  const startTime = fromZonedTime(`${dateISO} ${time}:00`, BARBERSHOP_TIMEZONE)
  const endTime = addMinutes(startTime, service.durationMin)

  // [6] Cria customer + appointment numa transacao.
  //     Indice unico parcial (barberId, startTime) WHERE status IN ('PENDING','CONFIRMED')
  //     garante atomicidade contra race conditions: P2002 = slot ja reservado.
  try {
    const appointment = await db.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: {
          barbershopId_phone: {
            barbershopId: barbershop.id,
            phone: customerPhone,
          },
        },
        create: {
          barbershopId: barbershop.id,
          name: customerName,
          phone: customerPhone,
          email: customerEmail || null,
        },
        update: {
          name: customerName,
          email: customerEmail || null,
        },
      })

      return tx.appointment.create({
        data: {
          barbershopId: barbershop.id,
          customerId: customer.id,
          serviceId,
          barberId,
          startTime,
          endTime,
          status: "PENDING",
          notes: notes || null,
          priceInCents: service.priceInCents,
        },
      })
    })

    revalidatePath("/dashboard/agenda")
    return { success: true, appointmentId: appointment.id }
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        error:
          "Esse horário acabou de ser reservado por outra pessoa. Por favor escolha outro.",
      }
    }
    throw e
  }
}