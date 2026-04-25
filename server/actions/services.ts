"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireBarbershop } from "@/lib/session"

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  priceInCents: z
    .number()
    .int("Preço deve ser um número inteiro em centavos")
    .positive("Preço deve ser maior que zero"),
  durationMin: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(5, "Duração mínima é 5 minutos")
    .max(480, "Duração máxima é 480 minutos"),
})

export async function listServices() {
  const barbershop = await requireBarbershop()
  return db.service.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function createService(input: unknown) {
  const barbershop = await requireBarbershop()

  const parsed = serviceSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    await db.service.create({
      data: { barbershopId: barbershop.id, ...parsed.data },
    })
    revalidatePath("/dashboard/servicos")
    return { success: true }
  } catch {
    return { error: "Erro ao criar serviço. Tente novamente." }
  }
}

export async function updateService(id: string, input: unknown) {
  const barbershop = await requireBarbershop()

  const parsed = serviceSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const service = await db.service.findUnique({ where: { id } })
  if (!service || service.barbershopId !== barbershop.id) {
    return { error: "Serviço não encontrado" }
  }

  try {
    await db.service.update({ where: { id }, data: parsed.data })
    revalidatePath("/dashboard/servicos")
    return { success: true }
  } catch {
    return { error: "Erro ao atualizar serviço. Tente novamente." }
  }
}

export async function deleteService(id: string) {
  const barbershop = await requireBarbershop()

  const service = await db.service.findUnique({ where: { id } })
  if (!service || service.barbershopId !== barbershop.id) {
    return { error: "Serviço não encontrado" }
  }

  try {
    await db.service.update({ where: { id }, data: { isActive: false } })
    revalidatePath("/dashboard/servicos")
    return { success: true }
  } catch {
    return { error: "Erro ao excluir serviço. Tente novamente." }
  }
}

export async function toggleServiceActive(id: string) {
  const barbershop = await requireBarbershop()

  const service = await db.service.findUnique({ where: { id } })
  if (!service || service.barbershopId !== barbershop.id) {
    return { error: "Serviço não encontrado" }
  }

  try {
    await db.service.update({ where: { id }, data: { isActive: !service.isActive } })
    revalidatePath("/dashboard/servicos")
    return { success: true }
  } catch {
    return { error: "Erro ao atualizar serviço. Tente novamente." }
  }
}
