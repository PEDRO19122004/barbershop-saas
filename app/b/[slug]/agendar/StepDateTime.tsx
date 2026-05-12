"use client"

import { useEffect, useState } from "react"
import { addDays, format, parseISO, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getAvailableSlotsAction } from "@/server/actions/appointments"

type Props = {
  barbershopSlug: string
  barberId: string
  serviceId: string
  selectedDate: string | null
  selectedTime: string | null
  onSelect: (date: string, time: string) => void
}

export function StepDateTime({
  barbershopSlug,
  barberId,
  serviceId,
  selectedDate,
  selectedTime,
  onSelect,
}: Props) {
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? parseISO(selectedDate) : undefined
  )
  const [slots, setSlots] = useState<string[] | null>(null)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(selectedTime)

  useEffect(() => {
    if (!date) return
    setSlots(null)
    setSelectedSlot(null)
    setIsLoadingSlots(true)

    const dateISO = format(date, "yyyy-MM-dd")
    getAvailableSlotsAction({ slug: barbershopSlug, barberId, serviceId, dateISO })
      .then((result) => {
        if ("slots" in result) setSlots(result.slots)
        else setSlots([])
      })
      .finally(() => setIsLoadingSlots(false))
  }, [date, barbershopSlug, barberId, serviceId])

  function handleDateSelect(newDate: Date | undefined) {
    setDate(newDate)
    setSlots(null)
    setSelectedSlot(null)
  }

  function handleSlotSelect(slot: string) {
    setSelectedSlot(slot)
    if (date) {
      onSelect(format(date, "yyyy-MM-dd"), slot)
    }
  }

  const today = startOfDay(new Date())
  const maxDate = addDays(today, 60)

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">Escolha a data e horário</h2>
      <p className="text-muted-foreground mt-1">Selecione quando você quer ser atendido</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Calendar */}
        <div className="flex justify-center md:justify-start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(d) => d < today || d > maxDate}
            locale={ptBR}
            className="rounded-xl border border-border bg-card p-3"
          />
        </div>

        {/* Slots */}
        <div>
          <div className="mb-3">
            <p className="font-semibold text-foreground">Horários disponíveis</p>
            {date && (
              <p className="text-sm text-muted-foreground mt-0.5 capitalize">
                {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            )}
          </div>

          {!date && (
            <p className="text-muted-foreground text-sm">Selecione uma data ao lado</p>
          )}

          {date && isLoadingSlots && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-md bg-muted" />
              ))}
            </div>
          )}

          {date && !isLoadingSlots && slots !== null && slots.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Nenhum horário disponível neste dia. Tente outra data.
            </p>
          )}

          {date && !isLoadingSlots && slots && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleSlotSelect(slot)}
                  className={cn(
                    "py-2 rounded-md border text-sm font-medium transition-colors",
                    selectedSlot === slot
                      ? "border-white bg-white text-zinc-950"
                      : "border-border text-foreground/80 hover:border-zinc-600"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
