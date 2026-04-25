import { notFound } from "next/navigation"
import Link from "next/link"
import { getDay } from "date-fns"
import { Calendar, Clock, MapPin, Phone } from "lucide-react"
import { db } from "@/lib/db"
import { formatCurrency, formatDuration } from "@/lib/format"
import { dayOfWeekToLabel } from "@/lib/availability"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const barbershop = await db.barbershop.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })
  if (!barbershop) return {}
  return {
    title: `${barbershop.name} — Agende seu horário`,
    description:
      barbershop.description ?? `Agende seu horário na ${barbershop.name}`,
  }
}

export default async function BarbershopPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const barbershop = await db.barbershop.findUnique({
    where: { slug },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
      barbers: {
        where: { isActive: true },
      },
      businessHours: {
        orderBy: { dayOfWeek: "asc" },
      },
    },
  })

  if (!barbershop) notFound()

  const todayDow = getDay(new Date())

  const initials = barbershop.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  return (
    <>
      {/* HERO */}
      <section className="bg-zinc-950 w-full py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 ring-2 ring-zinc-800">
            <AvatarImage src={barbershop.logoUrl ?? undefined} alt={barbershop.name} />
            <AvatarFallback className="text-2xl font-bold bg-zinc-800 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mt-6">
            {barbershop.name}
          </h1>

          {barbershop.description && (
            <p className="text-lg text-zinc-400 max-w-2xl mt-3">
              {barbershop.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-zinc-400">
            {barbershop.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                {barbershop.address}
              </span>
            )}
            {barbershop.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 shrink-0" />
                {barbershop.phone}
              </span>
            )}
          </div>

          <Button asChild size="lg" className="mt-8">
            <Link href={`/b/${slug}/agendar`}>
              <Calendar className="h-5 w-5 mr-2" />
              Agendar agora
            </Link>
          </Button>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="bg-zinc-950 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Serviços</h2>
            <p className="text-zinc-400 mt-1">Confira o que oferecemos</p>
          </div>

          {barbershop.services.length === 0 ? (
            <p className="text-zinc-500 mt-8">Nenhum serviço cadastrado ainda.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {barbershop.services.map((service) => (
                <div
                  key={service.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
                >
                  <p className="font-semibold text-lg text-white">{service.name}</p>
                  {service.description && (
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="flex items-center gap-1.5 text-zinc-500 text-sm">
                      <Clock className="h-4 w-4 shrink-0" />
                      {formatDuration(service.durationMin)}
                    </span>
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(service.priceInCents)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* EQUIPE */}
      {barbershop.barbers.length > 0 && (
        <section className="bg-zinc-950 border-t border-zinc-800/50 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-white">Nossa equipe</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              {barbershop.barbers.map((barber) => {
                const barberInitials = barber.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                return (
                  <div key={barber.id} className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 ring-2 ring-zinc-800">
                      <AvatarImage
                        src={barber.avatarUrl ?? undefined}
                        alt={barber.name}
                      />
                      <AvatarFallback className="text-lg font-bold bg-zinc-800 text-white">
                        {barberInitials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-base font-semibold text-white mt-3 text-center">
                      {barber.name}
                    </p>
                    {barber.bio && (
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1 text-center">
                        {barber.bio}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* HORÁRIO DE FUNCIONAMENTO */}
      {barbershop.businessHours.length > 0 && (
        <section className="bg-zinc-950 border-t border-zinc-800/50 py-16">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-white">
              Horário de funcionamento
            </h2>

            <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
              {barbershop.businessHours.map((bh) => {
                const isToday = bh.dayOfWeek === todayDow
                return (
                  <div
                    key={bh.dayOfWeek}
                    className={`px-6 py-3 flex justify-between items-center ${
                      isToday ? "bg-zinc-800/30" : ""
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        isToday ? "text-white font-medium" : "text-zinc-300"
                      }`}
                    >
                      {dayOfWeekToLabel(bh.dayOfWeek)}
                    </span>
                    {bh.isClosed ? (
                      <span className="text-sm text-zinc-500">Fechado</span>
                    ) : (
                      <span className="text-sm text-white">
                        {bh.openTime} às {bh.closeTime}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* STICKY CTA — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4 z-50">
        <Button asChild size="lg" className="w-full">
          <Link href={`/b/${slug}/agendar`}>
            <Calendar className="h-5 w-5 mr-2" />
            Agendar agora
          </Link>
        </Button>
      </div>

      {/* Spacer so sticky CTA doesn't cover content on mobile */}
      <div className="md:hidden h-20" />
    </>
  )
}
