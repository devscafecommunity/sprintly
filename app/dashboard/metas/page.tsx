"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Target, Globe, Lock, Sparkles, Trash2, Edit } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

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
    description: string
    status: string
    order_index: number
  }[]
}

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    visibility: "private",
  })
  const [aiPrompt, setAiPrompt] = useState("")
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: goalsData } = await supabase
        .from("goals")
        .select(`
          *,
          steps (
            id,
            title,
            description,
            status,
            order_index
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (goalsData) {
        setGoals(goalsData)
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      const { data: goalData, error } = await supabase
        .from("goals")
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            tags,
            visibility: formData.visibility,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setGoals((prev) => [{ ...goalData, steps: [] }, ...prev])

      // Reset form
      setFormData({
        title: "",
        description: "",
        tags: "",
        visibility: "private",
      })
      setCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating goal:", error)
    }
  }

  const generateRoadmapWithAI = async () => {
    if (!aiPrompt.trim()) return

    setGeneratingRoadmap(true)
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Crie um roadmap detalhado para a seguinte meta: "${aiPrompt}". 
        
        Retorne APENAS um JSON válido no seguinte formato:
        {
          "title": "Título da meta",
          "description": "Descrição detalhada da meta",
          "tags": ["tag1", "tag2", "tag3"],
          "steps": [
            {
              "title": "Nome da etapa",
              "description": "Descrição da etapa"
            }
          ]
        }
        
        Crie entre 5-10 etapas práticas e específicas. Use tags relevantes em português.`,
      })

      const roadmapData = JSON.parse(text)

      // Create goal with AI-generated data
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .insert([
          {
            user_id: user.id,
            title: roadmapData.title,
            description: roadmapData.description,
            tags: roadmapData.tags,
            visibility: "private",
          },
        ])
        .select()
        .single()

      if (goalError) throw goalError

      // Create steps
      const stepsToInsert = roadmapData.steps.map((step: any, index: number) => ({
        goal_id: goalData.id,
        title: step.title,
        description: step.description,
        order_index: index,
        status: "todo",
      }))

      const { data: stepsData, error: stepsError } = await supabase.from("steps").insert(stepsToInsert).select()

      if (stepsError) throw stepsError

      // Add to local state
      setGoals((prev) => [{ ...goalData, steps: stepsData }, ...prev])

      setAiPrompt("")
      setAiDialogOpen(false)
    } catch (error) {
      console.error("Error generating roadmap:", error)
    } finally {
      setGeneratingRoadmap(false)
    }
  }

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId)

      if (error) throw error

      setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-gray-900">Minhas Metas</h1>
        <div className="flex space-x-2">
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar com IA
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerar Roadmap com IA</DialogTitle>
                <DialogDescription>
                  Descreva sua meta e nossa IA criará um roadmap detalhado para você
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ai-prompt">Descreva sua meta</Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="Ex: Quero aprender Python para análise de dados..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={generateRoadmapWithAI}
                  disabled={generatingRoadmap || !aiPrompt.trim()}
                  className="w-full"
                >
                  {generatingRoadmap ? "Gerando..." : "Gerar Roadmap"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
                <DialogDescription>Defina uma nova meta para acompanhar seu progresso</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Meta</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Aprender Python"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva sua meta em detalhes..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    placeholder="programação, python, carreira"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="visibility">Visibilidade</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, visibility: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <Lock className="mr-2 h-4 w-4" />
                          Privada
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Globe className="mr-2 h-4 w-4" />
                          Pública
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Criar Meta
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta criada ainda</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira meta ou use nossa IA para gerar um roadmap</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Meta
              </Button>
              <Button variant="outline" onClick={() => setAiDialogOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar com IA
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const completedSteps = goal.steps?.filter((step) => step.status === "done").length || 0
            const totalSteps = goal.steps?.length || 0
            const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

            return (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-3">{goal.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {goal.visibility === "public" ? (
                        <Globe className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  {goal.tags && goal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {goal.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Criada em {new Date(goal.created_at).toLocaleDateString("pt-BR")}</span>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
