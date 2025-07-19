"use client"

import { useSession, signOut, SessionProvider } from "next-auth/react"
import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import SignInComponent from "@/components/signin"  // import it here

interface Post {
  id: string
  content: string
  createdAt: string
  author: {
    displayName: string | null
    accountUsername: string
    image: string | null
  }
}

function WhispContent() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    setLoading(true)
    const res = await fetch("/api/posts")
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePost = async () => {
    if (!newPost.trim()) return
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost }),
    })
    setNewPost("")
    fetchPosts()
  }

  if (status === "loading") {
    return <p className="text-center py-10">Loading...</p>
  }

  if (!session) {
    // Replace the old signin UI here with your imported SignInComponent
    return <SignInComponent />
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Post something, {session.user?.name}</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <Textarea
            value={newPost}
            onChange={(e) => {
              if (e.target.value.length <= 250) {
                setNewPost(e.target.value)
              }
            }}
            placeholder="What's on your mind?"
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {newPost.length} / 250 characters
          </p>
        </CardContent>

        <CardFooter>
          <Button onClick={handlePost}>Post</Button>
          <Button variant="ghost" className="ml-auto" onClick={() => signOut()}>
            Sign out
          </Button>
        </CardFooter>
      </Card>

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.image || "/default-avatar.png"}
                    alt="pfp"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium">
                      {post.author.displayName || post.author.accountUsername}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word" }}>
                  {post.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}

export default function WhispPage() {
  return (
    <SessionProvider>
      <WhispContent />
    </SessionProvider>
  )
}
