"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v3"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBarbershopAction } from "@/server/actions/barbershop"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z
    .string()
    .min(2, "URL deve ter pelo menos 2 caracteres")
    .max(50, "URL deve ter no máximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50)
}

export function OnboardingForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [slugEdited, setSlugEdited] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", phone: "", address: "" },
  })

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setValue("name", value)
    if (!slugEdited) setValue("slug", slugify(value))
  }

  async function onSubmit(data: FormData) {
    setError(null)
    const result = await createBarbershopAction(data)
    if (result?.error) {
      setError(result.error)
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  const slugValue = watch("slug")

  return (
    <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="h-1.5 w-8 rounded-full bg-white" />
          <div className="h-1.5 w-8 rounded-full bg-zinc-800" />
          <div className="h-1.5 w-8 rounded-full bg-zinc-800" />
        </div>
        <span className="text-xs text-zinc-500">Passo 1 de 1</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Vamos configurar sua barbearia
        </h1>
        <p className="mt-2 text-zinc-400">
          Preencha os dados básicos. Você pode editar tudo depois.
        </p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300 border-red-900/50 bg-red-950/30"
        >
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-zinc-300">
            Nome da barbearia
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Barbearia do Eren"
            className="h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600 transition-all duration-200 focus-visible:border-zinc-600 focus-visible:ring-zinc-700/50"
            {...register("name")}
            onChange={handleNameChange}
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug" className="text-zinc-300">
            URL da sua página
          </Label>
          <div className="flex h-11 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 transition-all duration-200 focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-700/50">
            <span className="flex select-none items-center border-r border-zinc-800 bg-zinc-900/80 px-3 text-sm text-zinc-500 whitespace-nowrap">
              barbersaas.com/b/
            </span>
            <input
              id="slug"
              type="text"
              placeholder="minha-barbearia"
              className="h-full flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-zinc-600"
              {...register("slug")}
              onChange={(e) => {
                setSlugEdited(true)
                setValue("slug", e.target.value)
              }}
            />
          </div>
          {errors.slug ? (
            <p className="text-xs text-red-400">{errors.slug.message}</p>
          ) : (
            slugValue && (
              <p className="text-xs text-zinc-500">
                Sua página: barbersaas.com/b/{slugValue}
              </p>
            )
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-zinc-300">
            Telefone{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            className="h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600 transition-all duration-200 focus-visible:border-zinc-600 focus-visible:ring-zinc-700/50"
            {...register("phone")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-zinc-300">
            Endereço{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Rua das Flores, 123 — São Paulo, SP"
            className="h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600 transition-all duration-200 focus-visible:border-zinc-600 focus-visible:ring-zinc-700/50"
            {...register("address")}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="h-11 w-full gap-2 transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Criando barbearia...
              </>
            ) : (
              "Criar barbearia"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
