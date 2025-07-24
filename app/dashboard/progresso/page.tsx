"use client"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { KanbanBoard } from "@/components/KanbanBoard"
import { PomodoroTimer } from "@/components/PomodoroTimer"
import { ProgressCharts } from "@/components/ProgressCharts"
import { SprintDialog } from "@/components/SprintDialog"
import { Play, BarChart3, Calendar, Trophy, Target } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ProgressoPage() {
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const [showCharts, setShowCharts] = useState(false)
  const [showSprintDialog, setShowSprintDialog] = useState(false)

  const handleMetaChange = (metaId: string) => {
    dispatch({ type: "SET_SELECTED_META", payload: metaId === "all" ? null : metaId })
  }

  const metaSelecionada = state.selectedMetaId ? state.metas.find((m) => m.id === state.selectedMetaId) : null

  const totalMetas = state.metas.length
  const metasConcluidas = state.metas.filter((meta) => meta.progresso === 100).length
  const progressoMedio = totalMetas > 0 ? state.metas.reduce((acc, meta) => acc + meta.progresso, 0) / totalMetas : 0

  const tasksConcluidas = state.tasks.filter((task) => task.status === "done").length
  const tasksTotal = state.tasks.length

  const handleEndSprint = () => {
    if (state.sprintAtivo) {
      dispatch({ type: "END_SPRINT", payload: state.sprintAtivo.id })
      dispatch({ type: "ADD_POINTS", payload: 50 }) // Reward for completing a sprint
      toast({
        title: "Sprint Encerrado!",
        description: `O sprint "${state.sprintAtivo.nome}" foi concluído. +50 pontos!`,
      })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Seu Progresso</h1>
        <p className="text-gray-600">Veja seu crescimento em tempo real</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetas}</div>
            <p className="text-xs text-muted-foreground">{metasConcluidas} concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progressoMedio)}%</div>
            <Progress value={progressoMedio} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasksConcluidas}/{tasksTotal}
            </div>
            <p className="text-xs text-muted-foreground">concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontuação</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.pontuacao}</div>
            <p className="text-xs text-muted-foreground">Nível {state.nivel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Seletor de Meta */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">🎯 Meta Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="meta-select">Filtrar Kanban por meta:</Label>
            <Select value={state.selectedMetaId || "all"} onValueChange={handleMetaChange}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as metas</SelectItem>
                {state.metas.map((meta) => (
                  <SelectItem key={meta.id} value={meta.id}>
                    {meta.nome} ({state.tasks.filter((t) => t.metaId === meta.id).length} tarefas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {metaSelecionada && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">{metaSelecionada.nome}</h4>
              <p className="text-sm text-blue-700">{metaSelecionada.descricao}</p>
              <div className="mt-2">
                <Progress value={metaSelecionada.progresso} className="h-2" />
                <p className="text-xs text-blue-600 mt-1">{metaSelecionada.progresso}% concluído</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de Sprint */}
      {state.sprintAtivo ? (
        <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            <Play className="w-5 h-5" /> Sprint Ativo: {state.sprintAtivo.nome}
          </CardTitle>
          <CardDescription className="text-blue-700 mt-1">
            Iniciado em: {new Date(state.sprintAtivo.inicioEm).toLocaleDateString()} | Termina em:{" "}
            {new Date(state.sprintAtivo.fimEm).toLocaleDateString()}
          </CardDescription>
          <div className="mt-3 flex gap-2">
            <Button variant="destructive" onClick={handleEndSprint}>
              Encerrar Sprint
            </Button>
            {/* Adicionar botão para ver detalhes do sprint se necessário */}
          </div>
        </Card>
      ) : (
        <div className="flex gap-4 mb-6">
          <Button onClick={() => setShowSprintDialog(true)} variant="outline">
            <Play className="w-4 h-4 mr-2" />
            Novo Sprint
          </Button>
        </div>
      )}

      {/* Gráficos */}
      <div className="flex gap-4 mb-6">
        <Button onClick={() => setShowCharts(!showCharts)} variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          {showCharts ? "Ocultar" : "Ver"} Gráficos
        </Button>
      </div>

      {showCharts && (
        <div className="mb-6">
          <ProgressCharts />
        </div>
      )}

      {/* Timer Pomodoro */}
      <div className="mb-6">
        <PomodoroTimer />
      </div>

      {/* Quadro Kanban */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quadro Kanban</h2>
        <KanbanBoard />
      </div>

      <SprintDialog open={showSprintDialog} onClose={() => setShowSprintDialog(false)} />
    </div>
  )
}
