"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v3"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Service } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createService, updateService } from "@/server/actions/services"

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  priceReais: z.number({ invalid_type_error: "Informe o preço" }).positive("Preço deve ser maior que zero"),
  durationMin: z
    .number({ invalid_type_error: "Informe a duração" })
    .int()
    .min(5, "Duração mínima é 5 minutos")
    .max(480, "Duração máxima é 480 minutos"),
})

type FormValues = z.infer<typeof formSchema>

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service
}

export function ServiceFormDialog({ open, onOpenChange, service }: ServiceFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      priceReais: undefined,
      durationMin: undefined,
    },
  })

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description ?? "",
        priceReais: service.priceInCents / 100,
        durationMin: service.durationMin,
      })
    } else {
      reset({ name: "", description: "", priceReais: undefined, durationMin: undefined })
    }
  }, [service, reset, open])

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      priceInCents: Math.round(values.priceReais * 100),
      durationMin: values.durationMin,
    }

    const result = service
      ? await updateService(service.id, payload)
      : await createService(payload)

    if ("error" in result) {
      toast.error(result.error)
      return
    }

    toast.success(service ? "Serviço atualizado!" : "Serviço criado!")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Editar serviço" : "Novo serviço"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Corte masculino" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Descreva o serviço..."
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="priceReais">Preço (R$)</Label>
              <Input
                id="priceReais"
                type="number"
                step="0.01"
                min="0"
                placeholder="50.00"
                {...register("priceReais", { valueAsNumber: true })}
              />
              {errors.priceReais && (
                <p className="text-xs text-destructive">{errors.priceReais.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="durationMin">Duração (min)</Label>
              <Input
                id="durationMin"
                type="number"
                step="5"
                min="5"
                max="480"
                placeholder="30"
                {...register("durationMin", { valueAsNumber: true })}
              />
              {errors.durationMin && (
                <p className="text-xs text-destructive">{errors.durationMin.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
