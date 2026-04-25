import { requireBarbershop } from "@/lib/session"
import { listServices } from "@/server/actions/services"
import { ServicesClient } from "./ServicesClient"

export default async function ServicosPage() {
  await requireBarbershop()
  const services = await listServices()
  return <ServicesClient services={services} />
}
