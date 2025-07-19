"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="flex justify-between p-4 border-b bg-muted">
      <h1 className="font-bold text-lg">MyAuthApp</h1>
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <Avatar>
              <AvatarImage src={session.user?.image ?? ""} />
              <AvatarFallback>{session.user?.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
            <Button variant="destructive" onClick={() => signOut()}>
              Sign Out
            </Button>
          </>
        ) : (
          <Button onClick={() => signIn("discord")}>Sign In</Button>
        )}
      </div>
    </nav>
  )
}