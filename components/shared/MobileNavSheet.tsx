"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./Sidebar"

type MobileNavSheetProps = {
  user: { name: string; email: string; image?: string | null }
  barbershop: { name: string; slug: string }
}

export function MobileNavSheet({ user, barbershop }: MobileNavSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu de navegação</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="p-0 w-64 bg-background border-border"
      >
        <Sidebar user={user} barbershop={barbershop} />
      </SheetContent>
    </Sheet>
  )
}
