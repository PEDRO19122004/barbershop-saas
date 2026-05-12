"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Barber = {
  id: string
  name: string
  bio: string | null
  avatarUrl: string | null
}

type Props = {
  barbers: Barber[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function StepBarber({ barbers, selectedId, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">Escolha o profissional</h2>
      <p className="text-muted-foreground mt-1">Quem você quer que faça o serviço?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        {barbers.map((barber) => {
          const initials = barber.name
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase()

          return (
            <button
              key={barber.id}
              onClick={() => onSelect(barber.id)}
              className={cn(
                "text-left bg-card border rounded-lg p-4 flex items-center gap-4 hover:border-border transition-colors",
                selectedId === barber.id
                  ? "border-white bg-muted"
                  : "border-border"
              )}
            >
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={barber.avatarUrl ?? undefined} alt={barber.name} />
                <AvatarFallback className="bg-zinc-700 text-foreground text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-semibold text-foreground">{barber.name}</span>
                {barber.bio && (
                  <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {barber.bio}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
