"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v3"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleIcon } from "@/components/shared/GoogleIcon"
import { signUpAction, signInWithGoogleAction } from "@/server/actions/auth"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

type FormData = z.infer<typeof schema>

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    const result = await signUpAction(data)
    if (result?.error) setError(result.error)
  }

  async function handleGoogle() {
    setIsGoogleLoading(true)
    await signInWithGoogleAction()
  }

  const isLoading = isSubmitting || isGoogleLoading

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Crie sua conta grátis
        </h1>
        <p className="mt-2 text-zinc-400">
          14 dias de trial, sem cartão de crédito
        </p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="animate-in fade-in slide-in-from-top-2 duration-300 border-red-900/50 bg-red-950/30"
        >
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-3 border-zinc-800 bg-zinc-900/50 text-white transition-all duration-200 hover:bg-zinc-800/60 hover:text-white disabled:opacity-50"
        onClick={handleGoogle}
        disabled={isLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Cadastrar com Google
      </Button>

      <div className="flex items-center">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="bg-zinc-950 px-4 text-xs text-zinc-500">
          ou continue com email
        </span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-zinc-300">
            Nome completo
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="João Silva"
            autoComplete="name"
            className="h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600 transition-all duration-200 focus-visible:border-zinc-600 focus-visible:ring-zinc-700/50"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            className="h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600 transition-all duration-200 focus-visible:border-zinc-600 focus-visible:ring-zinc-700/50"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-zinc-300">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600 transition-all duration-200 focus-visible:border-zinc-600 focus-visible:ring-zinc-700/50"
            {...register("password")}
          />
          <p className="mt-1 text-xs text-zinc-500">Mínimo 6 caracteres</p>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full gap-2 transition-all duration-200"
          disabled={isLoading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta grátis"
          )}
        </Button>
      </form>

      <div className="space-y-4">
        <p className="text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <Link
            href="/entrar"
            className="text-zinc-300 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline"
          >
            Entre
          </Link>
        </p>
        <p className="text-center text-xs text-zinc-600">
          Ao criar a conta, você concorda com os Termos de Uso
        </p>
      </div>
    </div>
  )
}
