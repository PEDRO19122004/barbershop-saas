"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireBarbershop } from "@/lib/session"

const createBarbershopSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z
    .string()
    .min(2, "URL deve ter pelo menos 2 caracteres")
    .max(50, "URL deve ter no máximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export async function createBarbershopAction(input: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado" }

  const parsed = createBarbershopSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message
    return { error: first ?? "Dados inválidos" }
  }

  const { name, slug, phone, address } = parsed.data
  const userId = session.user.id

  const slugExists = await db.barbershop.findUnique({ where: { slug } })
  if (slugExists) return { error: "Esse endereço já está em uso, escolha outro" }

  const existing = await db.barbershop.findUnique({ where: { userId } })
  if (existing) return { error: "Você já tem uma barbearia" }

  await db.$transaction(async (tx) => {
    const barbershop = await tx.barbershop.create({
      data: { userId, name, slug, phone: phone || null, address: address || null },
    })

    await tx.businessHours.createMany({
      data: [
        { barbershopId: barbershop.id, dayOfWeek: 0, openTime: "09:00", closeTime: "19:00", isClosed: true },
        { barbershopId: barbershop.id, dayOfWeek: 1, openTime: "09:00", closeTime: "19:00", isClosed: false },
        { barbershopId: barbershop.id, dayOfWeek: 2, openTime: "09:00", closeTime: "19:00", isClosed: false },
        { barbershopId: barbershop.id, dayOfWeek: 3, openTime: "09:00", closeTime: "19:00", isClosed: false },
        { barbershopId: barbershop.id, dayOfWeek: 4, openTime: "09:00", closeTime: "19:00", isClosed: false },
        { barbershopId: barbershop.id, dayOfWeek: 5, openTime: "09:00", closeTime: "19:00", isClosed: false },
        { barbershopId: barbershop.id, dayOfWeek: 6, openTime: "09:00", closeTime: "18:00", isClosed: false },
      ],
    })
  })

  return { success: true }
}

const updateBarbershopSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z
    .string()
    .min(2, "URL deve ter pelo menos 2 caracteres")
    .max(50, "URL deve ter no máximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export async function updateBarbershop(input: unknown) {
  const barbershop = await requireBarbershop()

  const parsed = updateBarbershopSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { slug, ...rest } = parsed.data

  if (slug !== barbershop.slug) {
    const slugExists = await db.barbershop.findUnique({ where: { slug } })
    if (slugExists) return { error: "Esse endereço já está em uso, escolha outro" }
  }

  try {
    await db.barbershop.update({
      where: { id: barbershop.id },
      data: { slug, ...rest },
    })
    revalidatePath("/dashboard/configuracoes")
    return { success: true }
  } catch {
    return { error: "Erro ao atualizar configurações. Tente novamente." }
  }
}
