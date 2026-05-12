import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { OnboardingForm } from "./OnboardingForm"

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/entrar")

  const barbershop = await db.barbershop.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (barbershop) redirect("/dashboard")

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <OnboardingForm />
    </main>
  )
}
