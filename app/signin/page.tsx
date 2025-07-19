"use client"

import { SessionProvider } from "next-auth/react"
import SignInComponent from "@/components/signin"

export default function SignInPage() {
  return (
    <SessionProvider>
      <SignInComponent />
    </SessionProvider>
  )
}