"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v3"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { BusinessHours } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { upsertBusinessHours } from "@/server/actions/business-hours"

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

const daySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(timeRegex, "HH:mm"),
  closeTime: z.string().regex(timeRegex, "HH:mm"),
  isClosed: z.boolean(),
})

const formSchema = z.object({
  days: z.array(daySchema).length(7),
})

type FormValues = z.infer<typeof formSchema>

const DAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
]

const DEFAULT_DAYS: FormValues["days"] = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  openTime: "09:00",
  closeTime: "19:00",
  isClosed: i === 0,
}))

interface HoursFormProps {
  initialHours: BusinessHours[]
}

export function HoursForm({ initialHours }: HoursFormProps) {
  const defaultDays =
    initialHours.length === 7
      ? [...initialHours]
          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          .map((h) => ({
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          }))
      : DEFAULT_DAYS

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { days: defaultDays },
  })

  const { fields } = useFieldArray({ control, name: "days" })

  async function onSubmit(values: FormValues) {
    const result = await upsertBusinessHours(values.days)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    toast.success("Horários salvos!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Horário de funcionamento</h1>
        <p className="text-zinc-400 mt-1">
          Configure os dias e horários em que sua barbearia recebe clientes.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900">
          {fields.map((field, index) => {
            const isClosed = watch(`days.${index}.isClosed`)
            return (
              <div
                key={field.id}
                className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800 last:border-0"
              >
                <span className="w-36 text-sm text-white font-medium shrink-0">
                  {DAY_NAMES[field.dayOfWeek]}
                </span>

                <input type="hidden" {...register(`days.${index}.dayOfWeek`, { valueAsNumber: true })} />

                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={!isClosed}
                    onCheckedChange={(checked) =>
                      setValue(`days.${index}.isClosed`, !checked, { shouldDirty: true })
                    }
                    size="sm"
                  />
                  <span className="text-xs text-zinc-400 w-14">
                    {isClosed ? "Fechado" : "Aberto"}
                  </span>
                </div>

                {isClosed ? (
                  <span className="text-sm text-zinc-600">Fechado</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
  type="time"
  className="w-28 h-8 text-sm bg-zinc-800 border-zinc-700 text-white [color-scheme:dark]"
  disabled={isClosed}
  {...register(`days.${index}.openTime`)}
/>
                    <span className="text-zinc-400 text-sm">às</span>
                   <Input
  type="time"
  className="w-28 h-8 text-sm bg-zinc-800 border-zinc-700 text-white [color-scheme:dark]"
  disabled={isClosed}
  {...register(`days.${index}.openTime`)}
/>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  )
}
