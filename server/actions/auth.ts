"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { signIn, signOut } from "@/lib/auth"
import { db } from "@/lib/db"

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const signUpSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export async function signInAction(input: unknown) {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) return { error: "Dados inválidos" }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou senha incorretos" }
    }
    throw error
  }
}

export async function signUpAction(input: unknown) {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message
    return { error: first ?? "Dados inválidos" }
  }

  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { error: "Este email já está em uso" }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.user.create({ data: { name, email, passwordHash } })

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/onboarding",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Conta criada, mas erro ao entrar. Tente fazer login." }
    }
    throw error
  }
}

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/onboarding" })
}

export async function signOutAction() {
  await signOut({ redirectTo: "/entrar" })
}
