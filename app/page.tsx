"use client"

import { useSession, signOut, SessionProvider } from "next-auth/react"
import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import SignInComponent from "@/components/signin"
import Sidebar from "@/components/sidebar"
import { DeletePostDialog } from "@/components/deletePostDialog"
import Loading from "@/components/loading"
import { ReportAbuseAlertDialog } from "@/components/reportAbuseDialog"

interface Post {
  id: string
  content: string
  createdAt: string
  imageUrl?: string
  author: {
    displayName: string | null
    name: string
    image: string | null
  }
  likes?: number
  likedByUser?: boolean
}

function WhispContent() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(true)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    const res = await fetch("/api/posts")
    const data: Post[] = await res.json()

    const postsWithLikes = await Promise.all(
      data.map(async (post) => {
        const res = await fetch(`/api/posts/likes?postId=${post.id}`)
        const { count, liked } = await res.json()
        return { ...post, likes: count, likedByUser: liked }
      })
    )

    setPosts(postsWithLikes)
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePost = async () => {
    if (!newPost.trim() && !imageFile) return

    let imageUrl: string | null = null

    if (imageFile) {
      const formData = new FormData()
      formData.append("image", imageFile)

      const res = await fetch("https://whispusercontent.linus.id.au/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHISP_CDN_API_TOKEN!}`,
        },
        body: formData,
      })

      if (!res.ok) {
        alert("Image upload failed")
        return
      }

      const data = await res.json()
      imageUrl = `https://whispusercontent.linus.id.au${data.url}`
    }

    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost, imageUrl }),
    })

    setNewPost("")
    setImageFile(null)
    setImagePreview(null)
    fetchPosts()
  }

  const toggleLike = async (postId: string, liked: boolean | undefined) => {
    const method = liked ? "DELETE" : "POST"
    await fetch("/api/posts/like", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    })

    fetchPosts()
  }


  if (status === "loading") return <Loading />
  if (!session) return <SignInComponent />

  return (
    <div className="min-h-screen bg-black text-white pl-48">
      <Sidebar />
      <main className="max-w-xl mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Post something, {session.user?.name}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent>
            <Textarea
              value={newPost}
              onChange={(e) => e.target.value.length <= 300 && setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="resize-none"
            />
            <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 rounded max-h-48 border border-white/20"
              />
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {newPost.length} / 300 characters
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
          <Loading />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author.image || "/default-avatar.png"}
                        alt="pfp"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">
                          {post.author.displayName || post.author.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{post.author.name || "unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {session.user?.name === post.author.name && (
                      <DeletePostDialog
                        postId={post.id}
                        onConfirm={async (id) => {
                          await fetch(`/api/posts?id=${id}`, { method: "DELETE" })
                          fetchPosts()
                        }}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{post.content}</p>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="[Content Deleted]"
                      className="mt-3 rounded max-h-60 border border-white/20"
                    />
                  )}
                </CardContent>
                <CardFooter className="flex gap-3 justify-end">
                  <Button
                    variant={post.likedByUser ? "default" : "ghost"}
                    onClick={() => toggleLike(post.id, post.likedByUser)}
                  >
                    👍 {post.likes ?? 0}
                  </Button>
                  <Button variant="ghost">Reply</Button>

                  {session.user?.name !== post.author.name && (
                    <ReportAbuseAlertDialog
                      postId={post.id}
                      postContent={post.content}
                      onReport={async (postId, reason) => {
                        const res = await fetch("/api/report/post", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ postId, postContent: post.content, reason }),
                        })
                        if (!res.ok) alert("Failed to report abuse")
                        else alert("Thanks for reporting.")
                      }}
                    />
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function WhispPage() {
  return (
    <SessionProvider>
      <WhispContent />
    </SessionProvider>
  )
}
