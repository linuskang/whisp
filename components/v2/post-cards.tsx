"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeletePostDialog } from "@/components/deletePostDialog"
import { ReportAbuseAlertDialog } from "@/components/reportAbuseDialog"
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { SharePostDialog } from "./share-post"

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return date.toLocaleDateString()
  }

  return (
    <Card className="w-full max-w-lg mx-auto border-0 shadow-sm bg-white dark:bg-gray-950">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-100 dark:border-gray-800">
              <AvatarImage
                src={post.author.image || "/default-avatar.png"}
                alt={post.author.displayName || post.author.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {(post.author.displayName || post.author.name).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {post.author.displayName || post.author.name}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">@{post.author.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {currentUsername === post.author.name ? (
                <DropdownMenuItem asChild>
                  <DeletePostDialog postId={post.id} onConfirm={onDelete} />
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
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
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3 px-6">
        <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={post.imageUrl || "/placeholder.svg"}
              alt="Post content"
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4 px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ${
                post.likedByUser
                  ? "text-red-600 hover:text-red-700"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-600"
              }`}
              onClick={() => onLikeToggle(post.id, post.likedByUser)}
            >
              <Heart className={`h-4 w-4 ${post.likedByUser ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{post.likes ?? 0}</span>
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Reply</span>
            </Button>

            <SharePostDialog postId={post.id} />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}