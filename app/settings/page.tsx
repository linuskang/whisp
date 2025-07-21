"use client"

import { useSession, signOut, SessionProvider } from "next-auth/react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import Sidebar from "@/components/sidebar"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function SettingsContent() {
  const { data: session, status } = useSession()
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.name) {
        const res = await fetch(`/api/user?username=${session.user.name}`)
        if (res.ok) {
          const userData = await res.json()
          setDisplayName(userData.displayName ?? "")
          setBio(userData.bio ?? "")
        }
      }
    }
    fetchUserData()
  }, [session])

  const handleSave = async () => {
    setSaving(true)
    await fetch("/api/user/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio }),
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (status === "loading") {
    return <p className="text-center py-10">Loading...</p>
  }

  if (!session) redirect("/signin")

  return (
    <div className="min-h-screen bg-black text-white pl-48">
      <Sidebar />
      <main className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-4 mt-4">
            {/* Profile Image */}
            {session.user?.image && (
              <div className="flex justify-center mb-4">
                <img
                  src={session.user.image}
                  alt="Profile Image"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            )}

            {/* Display user info */}
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="mb-2">{session.user?.name || "N/A"}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="mb-2">{session.user?.email || "N/A"}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Username</label>
              <p className="mb-2">{session.user?.name || "N/A"}</p>
            </div>

            {/* Editable fields */}
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Linus Kang"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Say something about yourself..."
                className="resize-none"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">{saved && "Changes saved."}</div>

            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              <Button variant="destructive" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <SessionProvider>
      <SettingsContent />
    </SessionProvider>
  )
}
