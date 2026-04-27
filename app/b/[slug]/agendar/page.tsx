import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { db } from "@/lib/db"
import { BookingFlow } from "./BookingFlow"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const barbershop = await db.barbershop.findUnique({
    where: { slug },
    select: { name: true },
  })
  if (!barbershop) return {}
  return { title: `Agendar — ${barbershop.name}` }
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { slug } = await params
  await searchParams

  const barbershop = await db.barbershop.findUnique({
    where: { slug },
    include: {
      services: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
      barbers: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
    },
  })

  if (!barbershop) notFound()

  return (
    <>
      <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href={`/b/${slug}`}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para a barbearia
        </Link>
        <span className="text-sm text-zinc-500">{barbershop.name}</span>
      </div>

      <BookingFlow
        barbershop={{ id: barbershop.id, name: barbershop.name, slug: barbershop.slug }}
        services={barbershop.services}
        barbers={barbershop.barbers}
      />
    </>
  )
}
