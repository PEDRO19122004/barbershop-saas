"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = ["Serviço", "Barbeiro", "Data e horário", "Seus dados"]

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden text-center text-sm text-zinc-400 mb-6">
        Passo {currentStep} de {STEPS.length}:{" "}
        <span className="text-white font-medium">{STEPS[currentStep - 1]}</span>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center mb-10">
        {STEPS.map((label, index) => {
          const step = index + 1
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted || isCurrent
                      ? "bg-white text-zinc-950 border-white"
                      : "bg-transparent text-zinc-500 border-zinc-700"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 whitespace-nowrap",
                    isCompleted || isCurrent ? "text-white" : "text-zinc-500"
                  )}
                >
                  {label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-3 mb-5 transition-colors",
                    step < currentStep ? "bg-white" : "bg-zinc-800"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
