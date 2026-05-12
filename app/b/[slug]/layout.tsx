export default function BarbershopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <main className="bg-background min-h-screen">{children}</main>
}
