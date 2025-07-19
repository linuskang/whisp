import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const username = url.searchParams.get("username")
  const id = url.searchParams.get("id")

  let user

  try {
    if (username) {
      user = await prisma.user.findFirst({
        where: { name: username },
        select: {
          id: true,
          displayName: true,
          name: true,
          bio: true,
          image: true,
          dateJoined: true,
          isVerified: true,
          isAdmin: true,
        },
      })
    } else if (id) {
      user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          displayName: true,
          name: true,
          bio: true,
          image: true,
          dateJoined: true,
          isVerified: true,
          isAdmin: true,
        },
      })
    } else {
      return new NextResponse("Missing query parameter", { status: 400 })
    }

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const displayName = user.displayName ?? user.name

    const responseData = {
      id: user.id,
      displayName,
      accountUsername: user.name,
      bio: user.bio,
      image: user.image,
      dateJoined: user.dateJoined,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error(error)
    return new NextResponse("Server error", { status: 500 })
  }
}
