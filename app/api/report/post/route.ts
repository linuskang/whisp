import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { discordLog } from "@/lib/discordLogging"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { postId, postContent, reason } = await req.json()

  if (!postId || !postContent) {
    return new NextResponse("Post ID and content required", { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

    if (post.authorId === user.id) {
      return new NextResponse("You can't report your own post", { status: 403 })
    }

    await discordLog({
      title: "Abuse Report",
      description: `User @**${session.user.name}** (${session.user.email}) reported a post.`,
      color: 0xffa500,
      fields: [
        { name: "Reported Post ID", value: postId, inline: true },
        { name: "Report Reason", value: reason || "No reason provided", inline: false },
        { name: "Post Content", value: postContent, inline: false },
      ],
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ message: "Report submitted" })
  } catch (error) {
    console.error("Failed to submit report:", error)
    return new NextResponse("Failed to submit report", { status: 500 })
  }
}