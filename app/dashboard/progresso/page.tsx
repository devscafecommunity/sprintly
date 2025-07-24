"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Calendar, Play, Pause, RotateCcw, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface Step {
  id: string
  title: string
  description: string
  status: "todo" | "doing" | "done"
  goal_id: string
  order_index: number
  goal: {
    title: string
    tags: string[]
  }
}

interface KanbanColumn {
  id: string
  title: string
  status: "todo" | "doing" | "done"
  items: Step[]
}

export default function ProgressoPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: "todo", title: "Backlog", status: "todo", items: [] },
    { id: "doing", title: "Fazendo", status: "doing", items: [] },
    { id: "done", title: "Concluído", status: "done", items: [] },
  ])
  const [loading, setLoading] = useState(true)
  const [pomodoroActive, setPomodoroActive] = useState(false)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes in seconds
  const [pomodoroInterval, setPomodoroInterval] = useState<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchSteps()
  }, [])

  useEffect(() => {
    if (pomodoroActive && pomodoroTime > 0) {
      const interval = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            setPomodoroActive(false)
            // Notification or sound could be added here
            return 25 * 60
          }
          return prev - 1
        })
      }, 1000)
      setPomodoroInterval(interval)
    } else {
      if (pomodoroInterval) {
        clearInterval(pomodoroInterval)
        setPomodoroInterval(null)
      }
    }

    return () => {
      if (pomodoroInterval) {
        clearInterval(pomodoroInterval)
      }
    }
  }, [pomodoroActive, pomodoroTime])

  const fetchSteps = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: stepsData } = await supabase
        .from("steps")
        .select(`
          *,
          goal:goals(title, tags)
        `)
        .eq("goal.user_id", user.id)
        .order("order_index")

      if (stepsData) {
        const updatedColumns = columns.map((column) => ({
          ...column,
          items: stepsData.filter((step) => step.status === column.status),
        }))
        setColumns(updatedColumns)
      }
    } catch (error) {
      console.error("Error fetching steps:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const draggedStep = sourceColumn.items[source.index]

    // Update step status in database
    try {
      const { error } = await supabase.from("steps").update({ status: destColumn.status }).eq("id", draggableId)

      if (error) throw error

      // Update local state
      const newSourceItems = [...sourceColumn.items]
      const newDestItems = [...destColumn.items]

      newSourceItems.splice(source.index, 1)

      const updatedStep = { ...draggedStep, status: destColumn.status }
      newDestItems.splice(destination.index, 0, updatedStep)

      const newColumns = columns.map((column) => {
        if (column.id === source.droppableId) {
          return { ...column, items: newSourceItems }
        }
        if (column.id === destination.droppableId) {
          return { ...column, items: newDestItems }
        }
        return column
      })

      setColumns(newColumns)
    } catch (error) {
      console.error("Error updating step status:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const togglePomodoro = () => {
    setPomodoroActive(!pomodoroActive)
  }

  const resetPomodoro = () => {
    setPomodoroActive(false)
    setPomodoroTime(25 * 60)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalSteps = columns.reduce((acc, col) => acc + col.items.length, 0)
  const completedSteps = columns.find((col) => col.id === "done")?.items.length || 0
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Progresso</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Sprint
          </Button>
        </div>
      </div>

      {/* Stats and Pomodoro */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.round(progressPercentage)}%</div>
            <Progress value={progressPercentage} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {completedSteps} de {totalSteps} etapas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{columns.find((col) => col.id === "doing")?.items.length || 0}</div>
            <p className="text-xs text-muted-foreground">etapas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Backlog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{columns.find((col) => col.id === "todo")?.items.length || 0}</div>
            <p className="text-xs text-muted-foreground">etapas pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Timer Pomodoro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{formatTime(pomodoroTime)}</div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={togglePomodoro}>
                {pomodoroActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={resetPomodoro}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6 md:grid-cols-3">
          {columns.map((column) => (
            <Card key={column.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{column.title}</CardTitle>
                  <Badge variant="secondary">{column.items.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] space-y-3 ${snapshot.isDraggingOver ? "bg-blue-50 rounded-lg" : ""}`}
                    >
                      {column.items.map((step, index) => (
                        <Draggable key={step.id} draggableId={step.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? "rotate-2 shadow-lg" : ""
                              }`}
                            >
                              <h4 className="font-medium mb-2">{step.title}</h4>
                              {step.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{step.description}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {step.goal.title}
                                </Badge>
                                {step.goal.tags && step.goal.tags.length > 0 && (
                                  <div className="flex space-x-1">
                                    {step.goal.tags.slice(0, 2).map((tag, tagIndex) => (
                                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {column.items.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                          <div className="text-4xl mb-2">📋</div>
                          <p className="text-sm">Nenhuma etapa aqui</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>

      {/* Progress Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights de Progresso</CardTitle>
          <CardDescription>Dicas personalizadas baseadas no seu comportamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedSteps === 0 && (
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Comece movendo uma etapa para "Fazendo"</p>
                  <p className="text-sm text-gray-600">Dar o primeiro passo é fundamental para criar momentum</p>
                </div>
              </div>
            )}

            {columns.find((col) => col.id === "doing")?.items.length === 0 && completedSteps > 0 && (
              <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Você não tem etapas em andamento</p>
                  <p className="text-sm text-gray-600">Mova uma etapa do backlog para manter o progresso constante</p>
                </div>
              </div>
            )}

            {progressPercentage > 50 && (
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Excelente progresso! 🎉</p>
                  <p className="text-sm text-gray-600">Você já completou mais da metade das suas etapas</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
