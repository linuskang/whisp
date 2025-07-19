"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Providers } from "@/app/providers"

interface UserData {
  id: string
  displayName: string | null
  accountUsername: string
  bio: string | null
  image: string | null
  dateJoined: string
  isVerified: boolean
  isAdmin: boolean
}

function HomeContent() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loadingUserData, setLoadingUserData] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      if (session?.user?.name) {
        setLoadingUserData(true)
        const res = await fetch(`/api/user?username=${session.user.name}`)
        if (res.ok) {
          const data = await res.json()
          setUserData(data)
        }
        setLoadingUserData(false)
      }
    }
    fetchUser()
  }, [session])

  if (status === "loading" || loadingUserData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <main className="flex justify-center items-center min-h-screen bg-background text-foreground">
      {session ? (
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader>
            <CardTitle>
              Welcome, {userData?.displayName ?? session.user?.name ?? "User"}!
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userData?.image ?? session.user?.image ?? undefined} />
              <AvatarFallback>
                {(userData?.displayName ?? session.user?.name ?? "?")[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>

            <p className="text-center text-sm text-muted-foreground">
              <strong>Username:</strong> {userData?.accountUsername ?? session.user?.name}
            </p>

            <p className="text-center text-sm text-muted-foreground">
              <strong>Email:</strong> {session.user?.email ?? "Not available"}
            </p>

            {userData?.bio && (
              <p className="text-center text-sm text-muted-foreground italic">"{userData.bio}"</p>
            )}

            <p className="text-center text-sm text-muted-foreground">
              <strong>Member since:</strong>{" "}
              {userData ? format(new Date(userData.dateJoined), "PP") : "Unknown"}
            </p>

            <p className="text-center text-sm text-muted-foreground">
              <strong>Verified:</strong> {userData?.isVerified ? "Yes ✅" : "No ❌"}
            </p>

            <p className="text-center text-sm text-muted-foreground">
              <strong>Admin:</strong> {userData?.isAdmin ? "Yes 👑" : "No"}
            </p>

            {session.expires && (
              <p className="text-center text-xs text-muted-foreground">
                Session expires: {format(new Date(session.expires), "PPpp")}
              </p>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-center">
            <Button variant="destructive" onClick={() => signOut()}>
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button onClick={() => signIn("discord")}>Sign in with Discord</Button>
      )}
    </main>
  )
}

export default function Home() {
  return (
    <Providers>
      <HomeContent />
    </Providers>
  )
}
