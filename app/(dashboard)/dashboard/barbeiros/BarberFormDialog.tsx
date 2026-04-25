"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v3"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Barber } from "@prisma/client"

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
import { createBarber, updateBarber } from "@/server/actions/barbers"

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface BarberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barber?: Barber
}

export function BarberFormDialog({ open, onOpenChange, barber }: BarberFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", bio: "", avatarUrl: "" },
  })

  useEffect(() => {
    if (barber) {
      reset({
        name: barber.name,
        bio: barber.bio ?? "",
        avatarUrl: barber.avatarUrl ?? "",
      })
    } else {
      reset({ name: "", bio: "", avatarUrl: "" })
    }
  }, [barber, reset, open])

  async function onSubmit(values: FormValues) {
    const result = barber
      ? await updateBarber(barber.id, values)
      : await createBarber(values)

    if ("error" in result) {
      toast.error(result.error)
      return
    }

    toast.success(barber ? "Barbeiro atualizado!" : "Barbeiro criado!")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{barber ? "Editar barbeiro" : "Novo barbeiro"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="João Silva" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio (opcional)</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="Ex: 10 anos de experiência com degradê e barba"
              {...register("bio")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl">URL do avatar (opcional)</Label>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://..."
              {...register("avatarUrl")}
            />
            {errors.avatarUrl && (
              <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>
            )}
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
