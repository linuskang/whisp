import { prisma } from "@/lib/prisma"

export async function deletePost(postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } })

  if (!post) throw new Error("Post not found")

  await prisma.like.deleteMany({ where: { postId } })
  await prisma.post.delete({ where: { id: postId } })

  return {
    id: post.id,
    content: post.content,
    authorId: post.authorId,
    deleted: true,
  }
}