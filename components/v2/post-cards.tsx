"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { DeletePostDialog } from "@/components/deletePostDialog"
import { ReportAbuseAlertDialog } from "@/components/reportAbuseDialog"

export interface Post {
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

interface PostCardProps {
  post: Post
  currentUsername: string
  onDelete: (postId: string) => Promise<void>
  onLikeToggle: (postId: string, liked: boolean | undefined) => Promise<void>
}

export function PostCard({ post, currentUsername, onDelete, onLikeToggle }: PostCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <img
              src={post.author.image || "/default-avatar.png"}
              alt="pfp"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-medium">{post.author.displayName || post.author.name}</p>
              <p className="text-xs text-muted-foreground">@{post.author.name || "unknown"}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          {currentUsername === post.author.name && (
            <DeletePostDialog postId={post.id} onConfirm={onDelete} />
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
          onClick={() => onLikeToggle(post.id, post.likedByUser)}
        >
          👍 {post.likes ?? 0}
        </Button>
        <Button variant="ghost">Reply</Button>
        {currentUsername !== post.author.name && (
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
  )
}