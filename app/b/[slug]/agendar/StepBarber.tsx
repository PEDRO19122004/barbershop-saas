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
      <h2 className="text-xl font-bold text-white">Escolha o profissional</h2>
      <p className="text-zinc-400 mt-1">Quem você quer que faça o serviço?</p>

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
                "text-left bg-zinc-900 border rounded-lg p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors",
                selectedId === barber.id
                  ? "border-white bg-zinc-800"
                  : "border-zinc-800"
              )}
            >
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={barber.avatarUrl ?? undefined} alt={barber.name} />
                <AvatarFallback className="bg-zinc-700 text-white text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-semibold text-white">{barber.name}</span>
                {barber.bio && (
                  <span className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
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
