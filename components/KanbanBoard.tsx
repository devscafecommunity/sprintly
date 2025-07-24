"use client"

import type React from "react"

import { useState } from "react"
import { useApp, type Task } from "@/contexts/AppContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal } from "lucide-react"
import { TaskDialog } from "@/components/TaskDialog"
import { useToast } from "@/hooks/use-toast"

const columns = [
  { id: "backlog", title: "Backlog", color: "bg-gray-100" },
  { id: "todo", title: "To Do", color: "bg-blue-100" },
  { id: "doing", title: "Doing", color: "bg-yellow-100" },
  { id: "done", title: "Done", color: "bg-green-100" },
] as const

export function KanbanBoard() {
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const [editingTask, setEditingTask] = useState<Task | null>(null) // State for editing task
  const [draggedTask, setDraggedTask] = useState<string | null>(null) // State for dragged task

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault()
    if (draggedTask) {
      const task = state.tasks.find((t) => t.id === draggedTask)
      if (task && task.status !== newStatus) {
        dispatch({
          type: "MOVE_TASK",
          payload: { taskId: draggedTask, newStatus },
        })

        if (newStatus === "done") {
          dispatch({ type: "ADD_POINTS", payload: 5 })

          // Atualizar progresso da meta se a configuração permitir
          if (state.settings.autoUpdateProgress) {
            const meta = state.metas.find((m) => m.id === task.metaId)
            if (meta) {
              const metaTasks = state.tasks.filter((t) => t.metaId === meta.id)
              // Calculate completed tasks including the one just moved
              const completedTasks =
                metaTasks.filter((t) => t.status === "done").length + (task.status !== "done" ? 1 : 0)
              const newProgress = metaTasks.length > 0 ? Math.round((completedTasks / metaTasks.length) * 100) : 0

              dispatch({
                type: "UPDATE_META",
                payload: { ...meta, progresso: newProgress },
              })
            }
          }

          toast({
            title: "Tarefa concluída!",
            description: "Parabéns! +5 pontos.",
          })
        }
      }
      setDraggedTask(null)
    }
  }

  const getTasksForColumn = (status: Task["status"]) => {
    let filteredTasks = state.tasks.filter((task) => task.status === status)

    // Filtrar por meta selecionada se houver uma
    if (state.selectedMetaId) {
      filteredTasks = filteredTasks.filter((task) => task.metaId === state.selectedMetaId)
    }

    // Ocultar tarefas concluídas se a configuração estiver desativada
    if (status === "done" && !state.settings.showCompletedTasks) {
      filteredTasks = []
    }

    return filteredTasks
  }

  const getMetaName = (metaId: string) => {
    const meta = state.metas.find((m) => m.id === metaId)
    if (!meta) {
      // console.warn(`Meta not found for ID: ${metaId}. Tasks:`, state.tasks.filter(t => t.metaId === metaId));
    }
    return meta?.nome || "Meta não encontrada"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`${column.color} rounded-lg p-4 min-h-[500px]`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id as Task["status"])}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{column.title}</h3>
            <Badge variant="secondary">{getTasksForColumn(column.id as Task["status"]).length}</Badge>
          </div>

          <div className="space-y-3">
            {getTasksForColumn(column.id as Task["status"]).map((task) => (
              <Card
                key={task.id}
                className="cursor-move hover:shadow-md transition-shadow bg-card text-card-foreground" // Changed bg-white to bg-card
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)} // Corrected to use handleDragStart
              >
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-1">{task.titulo}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{task.descricao}</p>{" "}
                  {/* Added text-muted-foreground */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getMetaName(task.metaId)}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setEditingTask(task)}>
                      {" "}
                      {/* Added onClick to open TaskDialog */}
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {column.id === "backlog" && (
            <Button
              variant="ghost"
              className="w-full mt-3 border-2 border-dashed border-gray-300 hover:border-gray-400"
              onClick={() => setEditingTask(null)} // Open TaskDialog for new task
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar tarefa
            </Button>
          )}
        </div>
      ))}

      <TaskDialog open={!!editingTask} onClose={() => setEditingTask(null)} editingTask={editingTask} />
    </div>
  )
}
