import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/signin")

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {session.user?.name}</h1>
      <p>Email: {session.user?.email}</p>
    </main>
  )
}