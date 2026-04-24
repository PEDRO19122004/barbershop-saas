import { requireAuth, requireBarbershop } from "@/lib/session"
import { Sidebar } from "@/components/shared/Sidebar"
import { DashboardHeader } from "@/components/shared/DashboardHeader"
import { MobileNavSheet } from "@/components/shared/MobileNavSheet"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const barbershop = await requireBarbershop()

  const sidebarUser = {
    name: user.name ?? "Usuário",
    email: user.email ?? "",
    image: user.image ?? null,
  }
  const sidebarBarbershop = { name: barbershop.name, slug: barbershop.slug }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Desktop sidebar (fixed) */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <Sidebar user={sidebarUser} barbershop={sidebarBarbershop} />
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col md:pl-64">
        <DashboardHeader
          barbershopSlug={barbershop.slug}
          user={{ name: sidebarUser.name, image: sidebarUser.image }}
          mobileNavTrigger={
            <MobileNavSheet user={sidebarUser} barbershop={sidebarBarbershop} />
          }
        />
        <main className="flex-1 px-6 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
