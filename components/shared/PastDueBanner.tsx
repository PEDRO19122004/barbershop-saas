"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export function PastDueBanner() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-yellow-500/30 bg-yellow-500/10 px-6 py-3">
      <div className="flex items-center gap-2 text-sm text-yellow-300">
        <AlertTriangle size={15} className="shrink-0" />
        <span>Seu último pagamento falhou. Atualize seu método de pagamento para evitar interrupções.</span>
      </div>
      <Link
        href="/dashboard/assinatura"
        className="shrink-0 text-sm font-medium text-yellow-400 underline-offset-2 hover:underline"
      >
        Resolver agora
      </Link>
    </div>
  )
}
