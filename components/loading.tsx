"use client"

import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Loading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white",
        className
      )}
    >
      <RefreshCw className="h-8 w-8 animate-spin text-white mb-4" />
      <span className="text-2xl font-bold font-mono tracking-tight uppercase">Whisp</span>
      <span className="text-sm text-white/70 mt-1">Loading...</span>
    </div>
  )
}