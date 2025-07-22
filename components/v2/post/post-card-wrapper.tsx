"use client"

import { PostCard, type Post } from "../post-cards"

interface PostCardClientWrapperProps {
  post: Post
  currentUsername: string
}

export function PostCardClientWrapper({ post, currentUsername }: PostCardClientWrapperProps) {
  const handleDelete = async (postId: string) => {
    try {
      await fetch(`/api/posts/delete?id=${postId}`, { method: "DELETE" })
      alert("Post deleted.")
    } catch (err) {
      alert("Failed to delete post.")
    }
  }

  const handleLikeToggle = async (postId: string, liked: boolean | undefined) => {
    try {
      await fetch(`/api/posts/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, liked }),
      })
      // You can trigger a re-fetch or refresh here later
    } catch (err) {
      alert("Failed to toggle like.")
    }
  }

  return (
    <PostCard
      post={post}
      currentUsername={currentUsername}
      onDelete={handleDelete}
      onLikeToggle={handleLikeToggle}
    />
  )
}