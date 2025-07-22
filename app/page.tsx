// V2 MAIN PAGE
// Created by: @linuskang

"use client"

import { SessionProvider } from "next-auth/react"
import WhispContent from "@/components/v2/main/whisp-content"

export default function WhispPage() {
  return (
    <SessionProvider>
      <WhispContent />
    </SessionProvider>
  )
}