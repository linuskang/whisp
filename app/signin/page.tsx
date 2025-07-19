"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useSession, signIn, SessionProvider } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

function SignInComponent() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    )
  }

  if (session) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="max-w-sm w-full flex flex-col items-center text-center space-y-10">
          <div className="text-8xl md:text-9xl font-mono font-extrabold text-white leading-none text-center">
            WHISP
          </div>
          <div className="w-full">
            <Button
              className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-lg text-lg font-semibold shadow-md transition-colors duration-300"
              onClick={() => signIn("discord")}
            >
              Sign in with Discord
            </Button>
            <p className="text-xs text-gray-400 mt-4">
              By signing in, you agree to the{" "}
              <Link href="/terms" className="text-blue-500 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-500 hover:underline">
                Privacy Policy.
              </Link>
            </p>
          </div>
        </div>
      </main>
      <footer className="flex flex-wrap justify-center gap-x-4 gap-y-2 p-4 text-xs text-gray-500">
        <Link href="/about" className="hover:underline">
          About
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <span>© {new Date().getFullYear()} Linus Kang Software.</span>
      </footer>
    </div>
  )
}

export default function SignInPage() {
  return (
    <SessionProvider>
      <SignInComponent />
    </SessionProvider>
  )
}
