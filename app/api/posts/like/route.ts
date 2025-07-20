import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { postId } = await req.json()
  if (!postId) {
    return new NextResponse("Post ID required", { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return new NextResponse("User not found", { status: 404 })
  }

  // Prevent duplicate likes with upsert or catch unique error
  try {
    await prisma.like.create({
      data: {
        userId: user.id,
        postId,
      },
    })
  } catch (error) {
    // Probably already liked
    return new NextResponse("Already liked", { status: 409 })
  }

  return NextResponse.json({ message: "Post liked" })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { postId } = await req.json()
  if (!postId) {
    return new NextResponse("Post ID required", { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return new NextResponse("User not found", { status: 404 })
  }

  await prisma.like.deleteMany({
    where: {
      userId: user.id,
      postId,
    },
  })

  return NextResponse.json({ message: "Post unliked" })
}