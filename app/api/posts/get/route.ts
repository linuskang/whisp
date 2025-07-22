import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get("id")

  if (!postId) {
    return new NextResponse("Missing post ID", { status: 400 })
  }

  try {
    const session = await getServerSession(authOptions)

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

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

    return NextResponse.json({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      imageUrl: post.imageUrl,
      author: post.author,
      likes: post.likes.length,
      likedByUser,
    })
  } catch (err) {
    console.error("Error fetching post:", err)
    return new NextResponse("Internal server error", { status: 500 })
  }
}