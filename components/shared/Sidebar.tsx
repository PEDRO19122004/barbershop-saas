"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Clock,
  Settings,
  CreditCard,
  ChevronUp,
  ExternalLink,
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/server/actions/auth"
import { cn } from "@/lib/utils"

type SidebarProps = {
  user: { name: string; email: string; image?: string | null }
  barbershop: { name: string; slug: string }
}

const navItems = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/servicos", label: "Serviços", icon: Scissors },
  { href: "/dashboard/barbeiros", label: "Barbeiros", icon: Users },
  { href: "/dashboard/horarios", label: "Horários", icon: Clock },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
]

function getInitials(name: string): string {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Sidebar({ user, barbershop }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="px-6 py-6">
        <span className="text-xl font-bold text-white">BarberSaaS</span>
      </div>

      <div className="border-t border-zinc-800" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}

        <div className="my-2 border-t border-zinc-800" />

        <Link
          href="/dashboard/assinatura"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/dashboard/assinatura")
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
          )}
        >
          <CreditCard size={18} />
          Assinatura
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-900">
              <Avatar size="sm">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="bg-zinc-700 text-zinc-200 text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col text-left">
                <span className="truncate text-sm font-medium text-white">
                  {user.name}
                </span>
                <span className="truncate text-xs text-zinc-500">
                  {user.email}
                </span>
              </div>
              <ChevronUp size={16} className="shrink-0 text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="w-56">
            <DropdownMenuLabel className="text-xs text-zinc-400 font-normal">
              {barbershop.name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href={`/b/${barbershop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink size={16} />
                Ver página pública
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracoes" className="flex items-center gap-2 cursor-pointer">
                <Settings size={16} />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onSelect={async () => {
                await signOutAction()
              }}
            >
              <LogOut size={16} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
