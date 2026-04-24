import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect("/entrar")
  return user
}

export async function getCurrentBarbershop() {
  const user = await getCurrentUser()
  if (!user) return null
  return db.barbershop.findUnique({ where: { userId: user.id! } })
}

export async function requireBarbershop() {
  const user = await requireAuth()
  const barbershop = await db.barbershop.findUnique({
    where: { userId: user.id! },
  })
  if (!barbershop) redirect("/onboarding")
  return barbershop
}
