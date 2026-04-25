import { requireBarbershop } from "@/lib/session"
import { listBusinessHours } from "@/server/actions/business-hours"
import { HoursForm } from "./HoursForm"

export default async function HorariosPage() {
  await requireBarbershop()
  const hours = await listBusinessHours()
  return <HoursForm initialHours={hours} />
}
