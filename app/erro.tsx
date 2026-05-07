"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Loga o erro no console pra debug em dev
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Ícone de aviso */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">
            Ops! Algo deu errado
          </h1>
          <p className="text-zinc-400">
            Encontramos um problema inesperado. Tente novamente em instantes —
            se persistir, entre em contato com o suporte.
          </p>

          {/* ID do erro pra debug (só aparece se tiver) */}
          {error.digest && (
            <p className="text-xs text-zinc-600 font-mono pt-2">
              ID: {error.digest}
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={() => reset()} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Tentar novamente
          </Button>

          <Button asChild variant="outline" className="gap-2 border-zinc-800">
            <Link href="/">
              <Home className="w-4 h-4" />
              Voltar pro início
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">
            BarberSaaS — Agendamento para Barbearias
          </p>
        </div>
      </div>
    </div>
  );
}