import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "BarberSaaS — Agendamento online para barbearias",
    template: "%s | BarberSaaS",
  },
  description:
    "Plataforma completa de agendamento para barbearias. Clientes agendam sozinhos pelo celular, você foca no corte. Sem aplicativo, sem dor de cabeça.",
  keywords: [
    "agendamento barbearia",
    "sistema barbearia",
    "agenda barbeiro",
    "marcação online barbearia",
    "BarberSaaS",
  ],
  authors: [{ name: "BarberSaaS" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://barbersaas.com.br",
    siteName: "BarberSaaS",
    title: "BarberSaaS — Agendamento online para barbearias",
    description:
      "Clientes agendam sozinhos pelo celular. Você foca no corte. Sem aplicativo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BarberSaaS — Agendamento online para barbearias",
    description:
      "Clientes agendam sozinhos. Você foca no corte. Sem aplicativo.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
