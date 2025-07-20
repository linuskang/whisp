import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { discordLog } from "@/lib/discordLogging"

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
    await discordLog({
      title: "Abuse Report",
      description: `User @**${session.user.name}** (${session.user.email}) reported a post.`,
      color: 0xFFA500,
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