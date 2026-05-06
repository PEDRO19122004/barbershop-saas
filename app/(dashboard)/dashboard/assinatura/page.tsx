import { getSubscriptionStatus } from "@/server/actions/stripe"
import { SubscriptionPanel } from "./SubscriptionPanel"

export default async function AssinaturaPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; required?: string }>
}) {
  const params = await searchParams
  const subscription = await getSubscriptionStatus()

  return (
    <SubscriptionPanel
      subscription={subscription}
      successFlag={params.success === "true"}
      canceledFlag={params.canceled === "true"}
    />
  )
}
