import { requireBarbershop } from "@/lib/session"
import { ConfigForm } from "./ConfigForm"

export default async function ConfiguracoesPage() {
  const barbershop = await requireBarbershop()
  return <ConfigForm barbershop={barbershop} />
}
