"use client"
import { useState, useRef } from "react"
import type React from "react"

import type { Session } from "next-auth"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Send, XCircle } from "lucide-react"

interface PostBoxProps {
  session: Session
  onPostCreated: () => void
}

export function PostBox({ session, onPostCreated }: PostBoxProps) {
  const [newPost, setNewPost] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

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
    onPostCreated()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6 shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <CardContent className="pt-6 px-6 pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="w-10 h-10 border border-gray-200 dark:border-gray-700 flex-shrink-0">
            <AvatarImage
              src={session.user?.image || "/placeholder.svg?height=40&width=40&query=user avatar"}
              alt={session.user?.name || "User"}
            />
            <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newPost}
              onChange={(e) => e.target.value.length <= 300 && setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="resize-none min-h-[100px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-gray-400 dark:placeholder:text-gray-600 bg-transparent p-0"
            />
            {imagePreview && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mt-4">
                <img
                  src={imagePreview || "/placeholder.svg?height=192&width=500&query=image preview"}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full bg-red-500/80 hover:bg-red-600/90 text-white"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center px-6 pb-4 pt-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800 rounded-full"
            aria-label="Add image"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" ref={fileInputRef} />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{newPost.length} / 300</p>
          <Button
            onClick={handlePost}
            disabled={!newPost.trim() && !imageFile}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Post
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

PostBox.defaultProps = {
  session: {
    user: {
      name: "Guest",
      email: "guest@example.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    expires: "2025-12-31T23:59:59.999Z",
  },
  onPostCreated: () => console.log("Post created!"),
}