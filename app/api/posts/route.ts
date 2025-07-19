import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/posts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  try {
    const posts = await prisma.post.findMany({
      where: userId ? { authorId: userId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error(error)
    return new NextResponse("Failed to fetch posts", { status: 500 })
  }
}

// POST /api/posts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { content } = await req.json()

  if (!content || content.length > 250) {
    return new NextResponse("Invalid content", { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const post = await prisma.post.create({
      data: {
        content,
        authorId: user.id,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error(error)
    return new NextResponse("Failed to create post", { status: 500 })
  }
}
