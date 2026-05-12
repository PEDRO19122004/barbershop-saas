import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-foreground">
            BarberSaaS
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/precos"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Preços
            </Link>
            <Link
              href="/entrar"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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

      <footer className="border-t border-border py-8">
        <p className="text-center text-sm text-muted-foreground">
          © 2026 BarberSaaS. Feito com ☕ em São Paulo.
        </p>
      </footer>
    </div>
  )
}
