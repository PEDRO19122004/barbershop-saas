import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-white">
            BarberSaaS
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/precos"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Preços
            </Link>
            <Link
              href="/entrar"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <Button
              size="sm"
              className="h-8 px-4"
              asChild
            >
              <Link href="/cadastrar">Começar grátis</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-zinc-800 py-8">
        <p className="text-center text-sm text-zinc-400">
          © 2026 BarberSaaS. Feito com ☕ em São Paulo.
        </p>
      </footer>
    </div>
  )
}
