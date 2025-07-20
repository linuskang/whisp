"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Search, User, Settings } from "lucide-react"

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-10 left-6 z-50 w-48 p-6 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
      <h1 className="text-4xl md:text-5xl font-mono font-extrabold tracking-tighter mb-8 text-center text-white">
        WHISP
      </h1>
      <nav className="space-y-3">
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={name}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200",
              pathname === href && "text-white bg-white/10 font-semibold"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
