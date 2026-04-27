"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { addMinutes } from "date-fns"
import { db } from "@/lib/db"
import { getAvailableSlots } from "@/lib/availability"

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

  const date = new Date(`${input.dateISO}T00:00:00`)
  const slots = await getAvailableSlots({
    barbershopId: barbershop.id,
    barberId: input.barberId,
    serviceDurationMin: service.durationMin,
    date,
  })

  return { slots }
}

const createAppointmentSchema = z.object({
  slug: z.string().min(1),
  serviceId: z.string().min(1),
  barberId: z.string().min(1),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  customerPhone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10, "Telefone deve ter pelo menos 10 dígitos"),
  customerEmail: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional(),
})

export async function createAppointmentAction(
  input: unknown
): Promise<{ success: true; appointmentId: string } | { error: string }> {
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

  const date = new Date(`${dateISO}T00:00:00`)
  const availableSlots = await getAvailableSlots({
    barbershopId: barbershop.id,
    barberId,
    serviceDurationMin: service.durationMin,
    date,
  })

  if (!availableSlots.includes(time)) {
    return {
      error:
        "Esse horário acabou de ser reservado por outra pessoa. Por favor escolha outro.",
    }
  }

  const startTime = new Date(`${dateISO}T${time}:00`)
  const endTime = addMinutes(startTime, service.durationMin)

  const customer = await db.customer.upsert({
    where: { barbershopId_phone: { barbershopId: barbershop.id, phone: customerPhone } },
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

  const appointment = await db.appointment.create({
    data: {
      barbershopId: barbershop.id,
      customerId: customer.id,
      serviceId,
      barberId,
      startTime,
      endTime,
      status: "CONFIRMED",
      notes: notes || null,
      priceInCents: service.priceInCents,
    },
  })

  revalidatePath("/dashboard/agenda")

  return { success: true, appointmentId: appointment.id }
}
