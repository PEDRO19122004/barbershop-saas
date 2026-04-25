export default function BarbershopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <main className="bg-zinc-950 min-h-screen">{children}</main>
}
