export type Post = {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: string
  author: {
    name: string
    displayName?: string
    image?: string
  }
  likes?: number
  likedByUser?: boolean
}