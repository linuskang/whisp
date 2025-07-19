import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const data = await req.json()
  const allowedFields = ["displayName", "bio"]
  const updateData: Record<string, any> = {}

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      updateData[key] = data[key]
    }
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    })

    return new NextResponse("Updated", { status: 200 })
  } catch (error) {
    console.error(error)
    return new NextResponse("Server error", { status: 500 })
  }
}