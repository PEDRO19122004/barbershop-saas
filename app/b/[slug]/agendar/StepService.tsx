"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDuration } from "@/lib/format"

type Service = {
  id: string
  name: string
  description: string | null
  priceInCents: number
  durationMin: number
}

type Props = {
  services: Service[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function StepService({ services, selectedId, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">Escolha o serviço</h2>
      <p className="text-muted-foreground mt-1">Qual serviço você quer agendar?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={cn(
              "text-left bg-card border rounded-lg p-4 hover:border-border transition-colors",
              selectedId === service.id
                ? "border-white bg-muted"
                : "border-border"
            )}
          >
            <p className="font-semibold text-foreground">{service.name}</p>
            {service.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {service.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {formatDuration(service.durationMin)}
              </span>
              <span className="text-base font-semibold text-foreground">
                {formatCurrency(service.priceInCents)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
