"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Users, Calendar, Plus, CheckCircle, Flame } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

interface Goal {
  id: string
  title: string
  description: string
  tags: string[]
  visibility: string
  created_at: string
  steps: {
    id: string
    title: string
    status: string
  }[]
}

export default function DashboardOverview() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedSteps: 0,
    totalSteps: 0,
    activeStreak: 7,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Fetch goals with steps
        const { data: goalsData } = await supabase
          .from("goals")
          .select(`
            *,
            steps (
              id,
              title,
              status
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (goalsData) {
          setGoals(goalsData)

          // Calculate stats
          const totalGoals = goalsData.length
          const allSteps = goalsData.flatMap((goal) => goal.steps || [])
          const completedSteps = allSteps.filter((step) => step.status === "done").length
          const totalSteps = allSteps.length

          setStats({
            totalGoals,
            completedSteps,
            totalSteps,
            activeStreak: 7, // Mock data for now
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const progressPercentage = stats.totalSteps > 0 ? (stats.completedSteps / stats.totalSteps) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/dashboard/metas">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Meta
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGoals}</div>
            <p className="text-xs text-muted-foreground">+2 desde o mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etapas Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSteps}</div>
            <p className="text-xs text-muted-foreground">de {stats.totalSteps} etapas totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência Ativa</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStreak}</div>
            <p className="text-xs text-muted-foreground">dias consecutivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Goals */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metas Recentes</CardTitle>
            <CardDescription>Suas metas mais recentes e seu progresso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Você ainda não tem metas criadas</p>
                <Link href="/dashboard/metas">
                  <Button>Criar Primeira Meta</Button>
                </Link>
              </div>
            ) : (
              goals.map((goal) => {
                const completedSteps = goal.steps?.filter((step) => step.status === "done").length || 0
                const totalSteps = goal.steps?.length || 0
                const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge variant={goal.visibility === "public" ? "default" : "secondary"}>
                        {goal.visibility === "public" ? "Pública" : "Privada"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{goal.description}</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={progress} className="flex-1" />
                      <span className="text-sm text-gray-500">
                        {completedSteps}/{totalSteps}
                      </span>
                    </div>
                    {goal.tags && goal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {goal.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Suas ações mais recentes na plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Concluiu etapa "Configurar ambiente"</p>
                <p className="text-xs text-gray-500">há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Criou nova meta "Aprender React"</p>
                <p className="text-xs text-gray-500">ontem</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Recebeu comentário de apoio</p>
                <p className="text-xs text-gray-500">há 2 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse rapidamente as funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/metas">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Target className="mr-2 h-4 w-4" />
                Criar Nova Meta
              </Button>
            </Link>
            <Link href="/dashboard/progresso">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Progresso
              </Button>
            </Link>
            <Link href="/dashboard/social">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="mr-2 h-4 w-4" />
                Explorar Comunidade
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
