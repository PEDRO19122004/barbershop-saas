export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left: Form */}
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-left-8 duration-700">
          {children}
        </div>
      </div>

      {/* Right: Hero — hidden on mobile */}
      <div className="relative hidden overflow-hidden md:flex md:items-center md:justify-center">
        {/* Base radial gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, oklch(0.20 0 0) 0%, oklch(0.10 0 0) 55%, oklch(0.07 0 0) 100%)",
          }}
        />

        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 35% 55%, oklch(0.30 0 0) 0%, transparent 55%), radial-gradient(ellipse at 70% 25%, oklch(0.24 0 0) 0%, transparent 50%)",
            animation: "gradient-shift 15s ease-in-out infinite",
          }}
        />

        {/* Floating orbs */}
        <div
          className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full blur-3xl"
          style={{
            background: "oklch(0.28 0 0 / 0.12)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full blur-3xl"
          style={{
            background: "oklch(0.32 0 0 / 0.10)",
            animation: "float 10s ease-in-out 2s infinite",
          }}
        />
        <div
          className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full blur-2xl"
          style={{
            background: "oklch(0.25 0 0 / 0.15)",
            animation: "float 12s ease-in-out 4s infinite",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 h-56 w-56 rounded-full blur-3xl"
          style={{
            background: "oklch(0.26 0 0 / 0.10)",
            animation: "float 9s ease-in-out 1s infinite",
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Logo top-left */}
        <div className="absolute left-8 top-8 z-10">
          <span className="text-sm font-semibold tracking-wide text-zinc-500">
            BarberSaaS
          </span>
        </div>

        {/* Quote */}
        <div className="relative z-10 max-w-sm px-10 animate-in fade-in duration-1000">
          <blockquote className="space-y-5">
            <div className="h-px w-10 bg-zinc-600" />
            <p className="text-xl font-medium leading-relaxed text-white/85">
              &ldquo;Nossa agenda sempre cheia, clientes satisfeitos e zero dor
              de cabeça com gestão. A melhor decisão que tomei pro meu
              negócio.&rdquo;
            </p>
            <footer className="text-sm text-zinc-500">
              — Marcos Silva, Barbearia Reis
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
