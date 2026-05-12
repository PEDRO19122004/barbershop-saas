"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v3"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Barbershop } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatPhone } from "@/lib/format"
import { updateBarbershop } from "@/server/actions/barbershop"

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>

interface ConfigFormProps {
  barbershop: Barbershop
}

export function ConfigForm({ barbershop }: ConfigFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: barbershop.name,
      slug: barbershop.slug,
      description: barbershop.description ?? "",
      phone: barbershop.phone ?? "",
      address: barbershop.address ?? "",
    },
  })

  const slug = watch("slug")

  async function onSubmit(values: FormValues) {
    const result = await updateBarbershop(values)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    toast.success("Configurações salvas!")
    reset(values)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Edite as informações que seus clientes vão ver na página pública.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl rounded-lg border border-border bg-card p-6 space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome da barbearia</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">URL pública</Label>
            <div className="flex items-center rounded-md border border-border overflow-hidden focus-within:ring-2 focus-within:ring-zinc-600">
              <span className="bg-muted text-muted-foreground px-3 py-2 text-sm border-r border-border whitespace-nowrap shrink-0">
                barbersaas.com/b/
              </span>
              <input
                id="slug"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                {...register("slug")}
              />
            </div>
            {errors.slug ? (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            ) : (
              <a
                href={`/b/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors"
              >
                Ver página pública →
              </a>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Conte um pouco sobre sua barbearia..."
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register("phone")}
              onChange={(e) => {
                setValue("phone", formatPhone(e.target.value), { shouldDirty: true })
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Endereço completo</Label>
            <Input
              id="address"
              placeholder="Rua Exemplo, 123 — São Paulo, SP"
              {...register("address")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => reset()}
              disabled={!isDirty || isSubmitting}
            >
              Descartar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Salvar alterações
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
