import Link from "next/link"
import { Store } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BarbershopNotFound() {
  return (
    <div className="bg-zinc-950 min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <Store className="h-16 w-16 text-zinc-700" />
        <h1 className="text-2xl font-bold text-white mt-4">
          Barbearia não encontrada
        </h1>
        <p className="text-zinc-400 mt-2 max-w-sm">
          O link que você acessou pode estar incorreto ou a barbearia foi
          removida.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  )
}
