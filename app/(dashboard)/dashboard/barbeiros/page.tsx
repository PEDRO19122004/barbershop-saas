import { requireBarbershop } from "@/lib/session"
import { listBarbers } from "@/server/actions/barbers"
import { BarbersClient } from "./BarbersClient"

export default async function BarbeirosPage() {
  await requireBarbershop()
  const barbers = await listBarbers()
  return <BarbersClient barbers={barbers} />
}
