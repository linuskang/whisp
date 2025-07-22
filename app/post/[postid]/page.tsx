import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PostCardClientWrapper } from "@/components/v2/post/post-card-wrapper"
import Sidebar from "@/components/v2/app-sidebar"

interface PostPageProps {
  params: { postid: string }
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions)
  const postId = params.postid

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

  if (!post) return notFound()

  const currentUser = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null

  const likedByUser = currentUser
    ? post.likes.some((like) => like.userId === currentUser.id)
    : false

  return (
    <div className="min-h-screen bg-black text-white pl-48">
        <Sidebar />
        <div className="flex justify-center mt-8">
        <PostCardClientWrapper
            post={{
            id: post.id,
            content: post.content,
            createdAt: post.createdAt.toISOString(),
            imageUrl: post.imageUrl ?? undefined,
            author: {
                name: post.author.name ?? "",
                displayName: post.author.displayName,
                image: post.author.image,
            },
            likes: post.likes.length,
            likedByUser,
            }}
            currentUsername={currentUser?.name ?? "guest"}
        />
        </div>
    </div>
  )
}
