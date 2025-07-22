import { NextResponse } from "next/server"
import { discordLog } from "@/lib/discordLogging"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/posts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  const session = await getServerSession(authOptions)

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
        likes: true,
      },
    })

    let userIdForLike: string | null = null
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      if (user) {
        userIdForLike = user.id
      }
    }

    const formattedPosts = await Promise.all(posts.map(async (post) => {
      let likedByUser = false
      if (userIdForLike) {
        const userLike = await prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: userIdForLike,
              postId: post.id,
            },
          },
        })
        likedByUser = !!userLike
      }
      return {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        imageUrl: post.imageUrl,
        author: post.author,
        likes: post.likes.length,
        likedByUser,
      }
    }))

    return NextResponse.json(formattedPosts)
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

  const { content, imageUrl } = await req.json()

  if ((!content || content.length > 300) && !imageUrl) {
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
        imageUrl,
        authorId: user.id,
      },
    })

    const embed = {
      title: "New Post Created",
      description: `A new post has been created by @**${user.name || "Unknown User"}**.`,
      color: 0x00ff00,
      timestamp: new Date().toISOString(),
      fields: [
        { name: "Content", value: content, inline: false },
        { name: "Author ID", value: user.id, inline: true },
        { name: "Post ID", value: post.id, inline: true },
      ],
    }

    if (imageUrl) {
      embed.fields.push({ name: "Image URL", value: imageUrl, inline: false })
    }

    await discordLog(embed)
    return NextResponse.json(post)
  } catch (error) {
    console.error(error)
    return new NextResponse("Failed to create post", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const postId = searchParams.get("id")

  if (!postId) {
    return new NextResponse("Post ID required", { status: 400 })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, content: true }
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.id !== post.authorId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await prisma.like.deleteMany({
      where: { postId },
    })

    // 🗑️ Then delete the post
    await prisma.post.delete({
      where: { id: postId }
    })

    // 🛎️ Log the deletion
    const embed = {
      title: "Post Deleted",
      description: `A post was deleted by @**${user.name || "Unknown User"}**.`,
      color: 0xff0000,
      timestamp: new Date().toISOString(),
      fields: [
        { name: "Post ID", value: postId, inline: true },
        { name: "Author ID", value: user.id, inline: true },
        { name: "Deleted Content", value: post.content || "[No content]", inline: false },
      ],
    }
    await discordLog(embed)

    return NextResponse.json({ message: "Post deleted" })
  } catch (error) {
    console.error(error)
    return new NextResponse("Failed to delete post", { status: 500 })
  }
}