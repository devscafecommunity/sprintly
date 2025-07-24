"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Target, BarChart3, Settings, Trophy, Timer } from "lucide-react"
import { useApp } from "@/contexts/AppContext"
import { Badge } from "@/components/ui/badge"

const navigation = [
  { name: "Metas", href: "/dashboard/metas", icon: Target },
  { name: "Progresso", href: "/dashboard/progresso", icon: BarChart3 },
  { name: "Configurações", href: "/dashboard/config", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { state } = useApp()

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">🚀 Sprintly</h1>
      </div>

      <div className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Nível {state.nivel}</span>
          <Badge variant="secondary" className="bg-blue-600">
            <Trophy className="w-3 h-3 mr-1" />
            {state.pontuacao}
          </Badge>
        </div>

        {state.pomodoroAtivo && (
          <div className="flex items-center text-sm text-orange-400">
            <Timer className="w-4 h-4 mr-2" />
            {Math.floor(state.pomodoroTempo / 60)}:{(state.pomodoroTempo % 60).toString().padStart(2, "0")}
          </div>
        )}
      </div>
    </div>
  )
}
