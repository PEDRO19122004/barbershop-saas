import type { SubscriptionStatus } from "@prisma/client"

export function canAccessDashboard(
  subscription: { status: SubscriptionStatus } | null
): boolean {
  if (!subscription) return false
  return (
    subscription.status === "ACTIVE" ||
    subscription.status === "TRIALING" ||
    subscription.status === "PAST_DUE"
  )
}
