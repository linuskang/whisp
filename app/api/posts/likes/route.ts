import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const postId = url.searchParams.get("postId")

  if (!postId) {
    return new NextResponse("Post ID required", { status: 400 })
  }

  const session = await getServerSession(authOptions)

  // Get total likes count for the post
  const totalLikes = await prisma.like.count({
    where: { postId },
  })

  // Check if current user liked this post
  let likedByUser = false
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (user) {
      const userLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: user.id,
            postId,
          },
        },
      })
      likedByUser = !!userLike
    }
  }

  return NextResponse.json({ count: totalLikes, liked: likedByUser })
}
