"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type DashboardHeaderProps = {
  barbershopSlug: string
  user: { name: string; image?: string | null }
  mobileNavTrigger?: ReactNode
}

const routeLabels: Record<string, string> = {
  "/dashboard": "Visão geral",
  "/dashboard/agenda": "Agenda",
  "/dashboard/servicos": "Serviços",
  "/dashboard/barbeiros": "Barbeiros",
  "/dashboard/horarios": "Horários",
  "/dashboard/configuracoes": "Configurações",
  "/dashboard/assinatura": "Assinatura",
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function DashboardHeader({ barbershopSlug, user, mobileNavTrigger }: DashboardHeaderProps) {
  const pathname = usePathname()
  const currentLabel = routeLabels[pathname] ?? "Dashboard"

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur lg:px-8">
      {/* Left: mobile nav + breadcrumb */}
      <div className="flex items-center gap-3">
        {mobileNavTrigger}
        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-white font-medium">{currentLabel}</span>
        </nav>
      </div>

      {/* Right: public page button + avatar */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <a
            href={`/b/${barbershopSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver página pública
          </a>
        </Button>

        <div className="h-6 w-px bg-zinc-800" />

        <Avatar size="sm" className="size-8">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="bg-zinc-700 text-zinc-200 text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
