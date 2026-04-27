"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Stepper } from "./Stepper"
import { StepService } from "./StepService"
import { StepBarber } from "./StepBarber"
import { StepDateTime } from "./StepDateTime"
import { StepCustomerData } from "./StepCustomerData"

type Service = {
  id: string
  name: string
  description: string | null
  priceInCents: number
  durationMin: number
}

type Barber = {
  id: string
  name: string
  bio: string | null
  avatarUrl: string | null
}

type Props = {
  barbershop: {
    id: string
    name: string
    slug: string
  }
  services: Service[]
  barbers: Barber[]
}

export function BookingFlow({ barbershop, services, barbers }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const stepRaw = Number(searchParams.get("step") || 1)
  const serviceId = searchParams.get("service")
  const barberId = searchParams.get("barber")
  const dateISO = searchParams.get("date")
  const time = searchParams.get("time")

  // Calcula o step efetivo: se faltam dados de steps anteriores, força recuar
  let step = stepRaw
  if (stepRaw >= 2 && !serviceId) step = 1
  else if (stepRaw >= 3 && !barberId) step = 2
  else if (stepRaw >= 4 && (!dateISO || !time)) step = 3

  // Sincroniza URL se o step efetivo for diferente do raw (apenas uma vez)
  useEffect(() => {
    if (step !== stepRaw) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("step", String(step))
      router.replace(`?${params.toString()}`, { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, stepRaw])

  function updateUrl(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    router.push(`?${params.toString()}`, { scroll: true })
  }

  function goBack() {
    if (step > 1) updateUrl({ step: String(step - 1) })
  }

  function goForward() {
    if (step < 4 && canContinue) updateUrl({ step: String(step + 1) })
  }

  const canContinue =
    (step === 1 && !!serviceId) ||
    (step === 2 && !!barberId) ||
    (step === 3 && !!dateISO && !!time) ||
    step === 4

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Stepper currentStep={step} />

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-10 mt-8">
        <div
          key={step}
          className="animate-in fade-in slide-in-from-right-4 duration-300"
        >
          {step === 1 && (
            <StepService
              services={services}
              selectedId={serviceId}
              onSelect={(id) => updateUrl({ service: id, step: "2" })}
            />
          )}

          {step === 2 && (
            <StepBarber
              barbers={barbers}
              selectedId={barberId}
              onSelect={(id) => updateUrl({ barber: id, step: "3" })}
            />
          )}

          {step === 3 && barberId && serviceId && (
            <StepDateTime
              barbershopSlug={barbershop.slug}
              barberId={barberId}
              serviceId={serviceId}
              selectedDate={dateISO}
              selectedTime={time}
              onSelect={(date, t) => updateUrl({ date, time: t })}
            />
          )}

          {step === 4 && serviceId && barberId && dateISO && time && (
            <StepCustomerData
              barbershopSlug={barbershop.slug}
              serviceId={serviceId}
              barberId={barberId}
              dateISO={dateISO}
              time={time}
              services={services}
              barbers={barbers}
              onBack={() => updateUrl({ step: "3" })}
            />
          )}
        </div>
      </div>

      {step < 4 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={step === 1}
            className="text-zinc-400 hover:text-white"
          >
            Voltar
          </Button>

          <Button disabled={!canContinue} onClick={goForward}>
            Continuar
          </Button>
        </div>
      )}
    </div>
  )
}