"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Scissors, MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Service } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { formatCurrency, formatDuration } from "@/lib/format"
import { deleteService, toggleServiceActive } from "@/server/actions/services"
import { ServiceFormDialog } from "./ServiceFormDialog"

interface ServicesClientProps {
  services: Service[]
}

export function ServicesClient({ services: initialServices }: ServicesClientProps) {
  const router = useRouter()
  const [services, setServices] = useState(initialServices)
  useEffect(() => {
  setServices(initialServices)
}, [initialServices])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [serviceInEdit, setServiceInEdit] = useState<Service | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Service | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreate() {
    setServiceInEdit(undefined)
    setDialogOpen(true)
  }

  function openEdit(service: Service) {
    setServiceInEdit(service)
    setDialogOpen(true)
  }

  async function handleToggle(service: Service) {
    const result = await toggleServiceActive(service.id)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s))
    )
    toast.success(service.isActive ? "Serviço desativado" : "Serviço ativado")
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteService(deleteTarget.id)
    setIsDeleting(false)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    setDeleteTarget(undefined)
    toast.success("Serviço excluído")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground mt-1">Cadastre os serviços que sua barbearia oferece.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Novo serviço
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 flex flex-col items-center text-center gap-4">
          <Scissors className="size-12 text-zinc-600" />
          <div>
            <p className="text-base font-medium text-foreground">Nenhum serviço cadastrado ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre o primeiro serviço pra começar a aceitar agendamentos
            </p>
          </div>
          <Button onClick={openCreate}>Cadastrar serviço</Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Nome</TableHead>
                <TableHead className="text-muted-foreground">Duração</TableHead>
                <TableHead className="text-muted-foreground">Preço</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow
                  key={service.id}
                  className="border-border hover:bg-card/50"
                >
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full shrink-0 ${
                          service.isActive ? "bg-green-500" : "bg-zinc-600"
                        }`}
                      />
                      <span className="font-medium text-foreground">{service.name}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDuration(service.durationMin)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(service.priceInCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted">
    <MoreHorizontal className="size-4" />
    <span className="sr-only">Ações</span>
  </Button>
</DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(service)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle(service)}>
                          {service.isActive ? "Desativar" : "Ativar"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(service)}
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) router.refresh()
        }}
        service={serviceInEdit}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(undefined)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir serviço</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>? Esta ação não
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
