"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Heart, MessageCircle, Share2, Users, Flame, Lightbulb, Zap, Search, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface SharedGoal {
  id: string
  goal: {
    id: string
    title: string
    description: string
    tags: string[]
    steps: {
      status: string
    }[]
  }
  user: {
    username: string
    avatar_url: string
  }
  shared_at: string
  comments: {
    id: string
    content: string
    user: {
      username: string
    }
    created_at: string
  }[]
  reactions: {
    reaction_type: string
    user_id: string
  }[]
}

export default function SocialPage() {
  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchCurrentUser()
    fetchSharedGoals()
  }, [])

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchSharedGoals = async () => {
    try {
      const { data: sharedGoalsData } = await supabase
        .from("shared_goals")
        .select(`
          *,
          goal:goals(
            id,
            title,
            description,
            tags,
            steps(status)
          ),
          user:profiles(username, avatar_url),
          comments(
            id,
            content,
            created_at,
            user:profiles(username)
          ),
          reactions(reaction_type, user_id)
        `)
        .order("shared_at", { ascending: false })

      if (sharedGoalsData) {
        setSharedGoals(sharedGoalsData)
      }
    } catch (error) {
      console.error("Error fetching shared goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (sharedGoalId: string, reactionType: string) => {
    if (!currentUser) return

    try {
      // Check if user already reacted with this type
      const existingReaction = sharedGoals
        .find((sg) => sg.id === sharedGoalId)
        ?.reactions.find((r) => r.user_id === currentUser.id && r.reaction_type === reactionType)

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from("reactions")
          .delete()
          .eq("shared_goal_id", sharedGoalId)
          .eq("user_id", currentUser.id)
          .eq("reaction_type", reactionType)
      } else {
        // Add reaction
        await supabase.from("reactions").insert([
          {
            shared_goal_id: sharedGoalId,
            user_id: currentUser.id,
            reaction_type: reactionType,
          },
        ])
      }

      // Refresh data
      fetchSharedGoals()
    } catch (error) {
      console.error("Error handling reaction:", error)
    }
  }

  const handleComment = async (sharedGoalId: string) => {
    if (!currentUser || !newComment[sharedGoalId]?.trim()) return

    try {
      await supabase.from("comments").insert([
        {
          shared_goal_id: sharedGoalId,
          user_id: currentUser.id,
          content: newComment[sharedGoalId].trim(),
        },
      ])

      // Clear comment input
      setNewComment((prev) => ({ ...prev, [sharedGoalId]: "" }))

      // Refresh data
      fetchSharedGoals()
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const getReactionIcon = (type: string) => {
    switch (type) {
      case "force":
        return <Zap className="h-4 w-4" />
      case "idea":
        return <Lightbulb className="h-4 w-4" />
      case "progress":
        return <Flame className="h-4 w-4" />
      default:
        return <Heart className="h-4 w-4" />
    }
  }

  const getReactionColor = (type: string) => {
    switch (type) {
      case "force":
        return "text-yellow-500"
      case "idea":
        return "text-blue-500"
      case "progress":
        return "text-orange-500"
      default:
        return "text-red-500"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Comunidade</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input placeholder="Buscar metas..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Metas Compartilhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedGoals.length}</div>
            <p className="text-xs text-muted-foreground">na comunidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(sharedGoals.map((sg) => sg.user.username)).size}</div>
            <p className="text-xs text-muted-foreground">usuários compartilhando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Interações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sharedGoals.reduce((acc, sg) => acc + sg.reactions.length + sg.comments.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">reações e comentários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">média da comunidade</p>
          </CardContent>
        </Card>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {sharedGoals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma meta compartilhada ainda</h3>
              <p className="text-gray-600 mb-6">Seja o primeiro a compartilhar uma meta com a comunidade</p>
              <Button>Compartilhar Meta</Button>
            </CardContent>
          </Card>
        ) : (
          sharedGoals.map((sharedGoal) => {
            const completedSteps = sharedGoal.goal.steps?.filter((step) => step.status === "done").length || 0
            const totalSteps = sharedGoal.goal.steps?.length || 0
            const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

            const userReactions = sharedGoal.reactions.filter((r) => r.user_id === currentUser?.id)
            const reactionCounts = sharedGoal.reactions.reduce(
              (acc, reaction) => {
                acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1
                return acc
              },
              {} as { [key: string]: number },
            )

            return (
              <Card key={sharedGoal.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={sharedGoal.user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{sharedGoal.user.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{sharedGoal.user.username}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(sharedGoal.shared_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{sharedGoal.goal.title}</h3>
                    <p className="text-gray-600 mb-3">{sharedGoal.goal.description}</p>

                    {sharedGoal.goal.tags && sharedGoal.goal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {sharedGoal.goal.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {totalSteps > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso</span>
                          <span>
                            {completedSteps}/{totalSteps} etapas
                          </span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )}
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center space-x-4 pt-2 border-t">
                    {["force", "idea", "progress"].map((reactionType) => (
                      <Button
                        key={reactionType}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(sharedGoal.id, reactionType)}
                        className={`flex items-center space-x-1 ${
                          userReactions.some((r) => r.reaction_type === reactionType)
                            ? getReactionColor(reactionType)
                            : "text-gray-500"
                        }`}
                      >
                        {getReactionIcon(reactionType)}
                        <span>{reactionCounts[reactionType] || 0}</span>
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{sharedGoal.comments.length}</span>
                    </Button>
                  </div>

                  {/* Comments */}
                  {sharedGoal.comments.length > 0 && (
                    <div className="space-y-3 pt-2 border-t">
                      {sharedGoal.comments.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="flex space-x-2">
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{comment.user.username}</span> {comment.content}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="flex space-x-2 pt-2">
                    <Input
                      placeholder="Adicione um comentário de apoio..."
                      value={newComment[sharedGoal.id] || ""}
                      onChange={(e) =>
                        setNewComment((prev) => ({
                          ...prev,
                          [sharedGoal.id]: e.target.value,
                        }))
                      }
                      maxLength={100}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(sharedGoal.id)}
                      disabled={!newComment[sharedGoal.id]?.trim()}
                    >
                      Enviar
                    </Button>
                  </div>
                  {newComment[sharedGoal.id] && (
                    <p className="text-xs text-gray-500">
                      {100 - (newComment[sharedGoal.id]?.length || 0)} caracteres restantes
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
