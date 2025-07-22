"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import SignInComponent from "@/components/signin"
import Sidebar from "@/components/v2/app-sidebar"
import Loading from "@/components/loading"
import { PostCard, Post } from "@/components/v2/post-cards"
import { PostBox } from "@/components/v2/post-box"

export default function WhispContent() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    setLoading(true)
    const res = await fetch("/api/posts")
    const data: Post[] = await res.json()
    const postsWithLikes = await Promise.all(
      data.map(async (post) => {
        const res = await fetch(`/api/posts/likes?postId=${post.id}`)
        const { count, liked } = await res.json()
        return { ...post, likes: count, likedByUser: liked }
      }),
    )
    setPosts(postsWithLikes)
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

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
        <PostBox
          session={session}
          onPostCreated={fetchPosts}
        />

        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUsername={session.user?.name ?? "Unknown"}
                onDelete={async (id) => {
                  await fetch(`/api/posts?id=${id}`, { method: "DELETE" })
                  fetchPosts()
                }}
                onLikeToggle={toggleLike}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
