"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Users, MoreVertical, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Barber } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { deleteBarber, toggleBarberActive } from "@/server/actions/barbers"
import { BarberFormDialog } from "./BarberFormDialog"

interface BarbersClientProps {
  barbers: Barber[]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function BarbersClient({ barbers: initialBarbers }: BarbersClientProps) {
  const router = useRouter()
  const [barbers, setBarbers] = useState(initialBarbers)

// Sincroniza state quando o server traz dados novos
useEffect(() => {
  setBarbers(initialBarbers)
}, [initialBarbers])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [barberInEdit, setBarberInEdit] = useState<Barber | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Barber | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreate() {
    setBarberInEdit(undefined)
    setDialogOpen(true)
  }

  function openEdit(barber: Barber) {
    setBarberInEdit(barber)
    setDialogOpen(true)
  }

  async function handleToggle(barber: Barber) {
    const result = await toggleBarberActive(barber.id)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    setBarbers((prev) =>
      prev.map((b) => (b.id === barber.id ? { ...b, isActive: !b.isActive } : b))
    )
    toast.success(barber.isActive ? "Barbeiro desativado" : "Barbeiro ativado")
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteBarber(deleteTarget.id)
    setIsDeleting(false)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    setBarbers((prev) => prev.filter((b) => b.id !== deleteTarget.id))
    setDeleteTarget(undefined)
    toast.success("Barbeiro excluído")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Barbeiros</h1>
          <p className="text-zinc-400 mt-1">Cadastre os profissionais da sua equipe.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Novo barbeiro
        </Button>
      </div>

      {barbers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 p-12 flex flex-col items-center text-center gap-4">
          <Users className="size-12 text-zinc-600" />
          <div>
            <p className="text-base font-medium text-white">Nenhum barbeiro cadastrado ainda</p>
            <p className="text-sm text-zinc-500 mt-1">
              Cadastre os profissionais que atendem na sua barbearia
            </p>
          </div>
          <Button onClick={openCreate}>Cadastrar barbeiro</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative"
            >
              <div className="flex items-start justify-between">
                <Avatar className="size-16">
                  {barber.avatarUrl && <AvatarImage src={barber.avatarUrl} alt={barber.name} />}
                  <AvatarFallback className="text-base">{getInitials(barber.name)}</AvatarFallback>
                </Avatar>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
  <MoreVertical className="size-4" />
                      <span className="sr-only">Ações</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(barber)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggle(barber)}>
                      {barber.isActive ? "Desativar" : "Ativar"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(barber)}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-lg font-semibold text-white mt-3">{barber.name}</p>
              {barber.bio && (
                <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{barber.bio}</p>
              )}

              <div className="mt-4">
                {barber.isActive ? (
                  <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-zinc-500 border-zinc-700">
                    Inativo
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <BarberFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) router.refresh()
        }}
        barber={barberInEdit}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(undefined)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir barbeiro</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <span className="font-medium text-white">{deleteTarget?.name}</span>? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(undefined)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
