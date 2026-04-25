"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireBarbershop } from "@/lib/session"

const barberSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  bio: z.string().optional(),
  avatarUrl: z.string().url("URL do avatar inválida").optional().or(z.literal("")),
})

export async function listBarbers() {
  const barbershop = await requireBarbershop()
  return db.barber.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function createBarber(input: unknown) {
  const barbershop = await requireBarbershop()

  const parsed = barberSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { avatarUrl, ...rest } = parsed.data

  try {
    await db.barber.create({
      data: {
        barbershopId: barbershop.id,
        ...rest,
        avatarUrl: avatarUrl || null,
      },
    })
    revalidatePath("/dashboard/barbeiros")
    return { success: true }
  } catch {
    return { error: "Erro ao criar barbeiro. Tente novamente." }
  }
}

export async function updateBarber(id: string, input: unknown) {
  const barbershop = await requireBarbershop()

  const parsed = barberSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const barber = await db.barber.findUnique({ where: { id } })
  if (!barber || barber.barbershopId !== barbershop.id) {
    return { error: "Barbeiro não encontrado" }
  }

  const { avatarUrl, ...rest } = parsed.data

  try {
    await db.barber.update({
      where: { id },
      data: { ...rest, avatarUrl: avatarUrl || null },
    })
    revalidatePath("/dashboard/barbeiros")
    return { success: true }
  } catch {
    return { error: "Erro ao atualizar barbeiro. Tente novamente." }
  }
}

export async function deleteBarber(id: string) {
  const barbershop = await requireBarbershop()

  const barber = await db.barber.findUnique({ where: { id } })
  if (!barber || barber.barbershopId !== barbershop.id) {
    return { error: "Barbeiro não encontrado" }
  }

  try {
    await db.barber.update({ where: { id }, data: { isActive: false } })
    revalidatePath("/dashboard/barbeiros")
    return { success: true }
  } catch {
    return { error: "Erro ao excluir barbeiro. Tente novamente." }
  }
}

export async function toggleBarberActive(id: string) {
  const barbershop = await requireBarbershop()

  const barber = await db.barber.findUnique({ where: { id } })
  if (!barber || barber.barbershopId !== barbershop.id) {
    return { error: "Barbeiro não encontrado" }
  }

  try {
    await db.barber.update({ where: { id }, data: { isActive: !barber.isActive } })
    revalidatePath("/dashboard/barbeiros")
    return { success: true }
  } catch {
    return { error: "Erro ao atualizar barbeiro. Tente novamente." }
  }
}
