"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useApp, type Task } from "@/contexts/AppContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface TaskDialogProps {
  open: boolean
  onClose: () => void
  editingTask?: Task | null // Added editingTask prop
}

export function TaskDialog({ open, onClose, editingTask }: TaskDialogProps) {
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    metaId: "",
  })

  useEffect(() => {
    if (editingTask) {
      setFormData({
        titulo: editingTask.titulo,
        descricao: editingTask.descricao,
        metaId: editingTask.metaId,
      })
    } else {
      setFormData({
        titulo: "",
        descricao: "",
        metaId: state.selectedMetaId || state.metas[0]?.id || "", // Pre-select if a meta is selected in Kanban
      })
    }
  }, [editingTask, open, state.selectedMetaId, state.metas]) // Added state.metas to dependencies

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.titulo || !formData.metaId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e selecione uma meta",
        variant: "destructive",
      })
      return
    }

    if (editingTask) {
      const updatedTask: Task = {
        ...editingTask,
        titulo: formData.titulo,
        descricao: formData.descricao,
        metaId: formData.metaId,
      }
      dispatch({ type: "UPDATE_TASK", payload: updatedTask })
      toast({
        title: "Tarefa atualizada!",
        description: "As alterações foram salvas.",
      })
    } else {
      const task: Task = {
        id: Date.now().toString(),
        titulo: formData.titulo,
        descricao: formData.descricao,
        metaId: formData.metaId,
        status: "backlog",
        criadaEm: new Date().toISOString(),
      }
      dispatch({ type: "ADD_TASK", payload: task })
      dispatch({ type: "ADD_POINTS", payload: 2 })

      toast({
        title: "Tarefa criada!",
        description: "Nova tarefa adicionada ao backlog. +2 pontos!",
      })
    }

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle> {/* Dynamic title */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Estudar variáveis em Python"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva a tarefa..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="meta">Meta *</Label>
            <Select
              value={formData.metaId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, metaId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma meta" />
              </SelectTrigger>
              <SelectContent>
                {state.metas.map((meta) => (
                  <SelectItem key={meta.id} value={meta.id}>
                    {meta.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editingTask ? "Atualizar Tarefa" : "Criar Tarefa"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
