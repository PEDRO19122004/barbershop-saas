"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, formatDuration, formatPhone } from "@/lib/format"
import { createAppointmentAction } from "@/server/actions/appointments"

const schema = z.object({
  customerName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  customerPhone: z
    .string()
    .refine(
      (v) => v.replace(/\D/g, "").length >= 10,
      "Telefone deve ter pelo menos 10 dígitos"
    ),
  customerEmail: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional(),
})

type FormData = {
  customerName: string
  customerPhone: string
  customerEmail?: string
  notes?: string
}

type Service = {
  id: string
  name: string
  priceInCents: number
  durationMin: number
}

type Barber = {
  id: string
  name: string
}

type Props = {
  barbershopSlug: string
  serviceId: string
  barberId: string
  dateISO: string
  time: string
  services: Service[]
  barbers: Barber[]
  onBack: () => void
}

export function StepCustomerData({
  barbershopSlug,
  serviceId,
  barberId,
  dateISO,
  time,
  services,
  barbers,
  onBack,
}: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const service = services.find((s) => s.id === serviceId)
  const barber = barbers.find((b) => b.id === barberId)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    try {
      const result = await createAppointmentAction({
        slug: barbershopSlug,
        serviceId,
        barberId,
        dateISO,
        time,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || undefined,
        notes: data.notes || undefined,
      })

      if ("error" in result) {
        toast.error(result.error)
        if (result.error.includes("horário")) {
          onBack()
        }
        return
      }

      router.push(`/b/${barbershopSlug}/agendar/sucesso?id=${result.appointmentId}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const parsedDate = parseISO(dateISO)

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <h2 className="text-xl font-bold text-foreground">Quase lá!</h2>
          <p className="text-muted-foreground mt-1">
            Preencha seus dados para confirmar o agendamento
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="text-foreground/80">
                Nome completo
              </Label>
              <Input
                id="customerName"
                placeholder="João Silva"
                className="bg-card border-border text-foreground placeholder:text-zinc-600"
                {...register("customerName")}
              />
              {errors.customerName && (
                <p className="text-xs text-red-400">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customerPhone" className="text-foreground/80">
                Telefone
              </Label>
              <Input
                id="customerPhone"
                placeholder="(11) 99999-9999"
                className="bg-card border-border text-foreground placeholder:text-zinc-600"
                {...register("customerPhone")}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value)
                  e.target.value = formatted
                  setValue("customerPhone", formatted)
                }}
              />
              {errors.customerPhone && (
                <p className="text-xs text-red-400">{errors.customerPhone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customerEmail" className="text-foreground/80">
                E-mail{" "}
                <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="joao@email.com"
                className="bg-card border-border text-foreground placeholder:text-zinc-600"
                {...register("customerEmail")}
              />
              {errors.customerEmail && (
                <p className="text-xs text-red-400">{errors.customerEmail.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-foreground/80">
                Observações{" "}
                <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Alguma observação para o profissional?"
                className="bg-card border-border text-foreground placeholder:text-zinc-600 resize-none"
                {...register("notes")}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                "Confirmar agendamento"
              )}
            </Button>
          </form>
        </div>

        {/* Summary */}
        <div className="md:sticky md:top-6 h-fit">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="font-semibold text-foreground">Resumo do agendamento</p>

            <div className="mt-4 divide-y divide-zinc-800">
              <SummaryRow label="Serviço" value={service?.name ?? "—"} />
              <SummaryRow
                label="Profissional"
                value={barber?.name ?? "—"}
              />
              <SummaryRow
                label="Data"
                value={
                  format(parsedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })
                }
                capitalize
              />
              <SummaryRow label="Horário" value={time} />
              {service && (
                <SummaryRow
                  label="Duração"
                  value={formatDuration(service.durationMin)}
                />
              )}
            </div>

            {service && (
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(service.priceInCents)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  capitalize,
}: {
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="py-3 flex justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-sm text-foreground text-right ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}
