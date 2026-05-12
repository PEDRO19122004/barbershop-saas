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
import { signInAction, signInWithGoogleAction } from "@/server/actions/auth"

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
})

type FormData = z.infer<typeof schema>

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    const result = await signInAction(data)
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Bem-vindo de volta
        </h1>
        <p className="mt-2 text-muted-foreground">
          Entre para gerenciar sua barbearia
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
        className="h-11 w-full gap-3 border-border bg-card/50 text-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
        onClick={handleGoogle}
        disabled={isLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continuar com Google
      </Button>

      <div className="flex items-center gap-0">
        <div className="h-px flex-1 bg-muted" />
        <span className="bg-background px-4 text-xs text-muted-foreground">
          ou continue com email
        </span>
        <div className="h-px flex-1 bg-muted" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-foreground/80">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            className="h-11 border-border bg-card/50 text-foreground placeholder:text-zinc-600 transition-all duration-200 focus-visible:border-zinc-600 focus-visible:ring-zinc-700/50"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-foreground/80">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-11 border-border bg-card/50 text-foreground placeholder:text-zinc-600 transition-all duration-200 focus-visible:border-zinc-600 focus-visible:ring-zinc-700/50"
            {...register("password")}
          />
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
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastrar"
          className="text-foreground/80 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
