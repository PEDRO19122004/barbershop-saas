import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  if (!id) notFound()

  const appointment = await db.appointment.findUnique({
    where: { id },
    include: {
      service: true,
      barber: true,
      customer: true,
      barbershop: { select: { name: true, slug: true } },
    },
  })

  if (!appointment) notFound()

  const slug = appointment.barbershop.slug

  return (
    <div className="container max-w-md mx-auto px-6 py-12 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-in zoom-in duration-500" />

      <h1 className="text-2xl font-bold text-white mt-4">
        Agendamento confirmado!
      </h1>
      <p className="text-zinc-400 mt-2">
        Você receberá uma confirmação em breve.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8 text-left divide-y divide-zinc-800">
        <SummaryRow label="Barbearia" value={appointment.barbershop.name} />
        <SummaryRow label="Serviço" value={appointment.service.name} />
        <SummaryRow label="Profissional" value={appointment.barber.name} />
        <SummaryRow
          label="Data"
          value={format(appointment.startTime, "EEEE, d 'de' MMMM", {
            locale: ptBR,
          })}
          capitalize
        />
        <SummaryRow
          label="Horário"
          value={format(appointment.startTime, "HH:mm")}
        />
        <SummaryRow
          label="Total"
          value={formatCurrency(appointment.priceInCents)}
        />
      </div>

      <Button asChild size="lg" className="mt-8 w-full">
        <Link href={`/b/${slug}`}>Voltar para a barbearia</Link>
      </Button>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  capitalize,
}: {
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="py-3 flex justify-between gap-4">
      <span className="text-sm text-zinc-400 shrink-0">{label}</span>
      <span
        className={`text-sm text-white text-right ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}
