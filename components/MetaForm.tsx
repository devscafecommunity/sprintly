"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useApp, type Meta } from "@/contexts/AppContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MetaFormProps {
  open: boolean
  onClose: () => void
  editingId?: string | null
  onEditComplete?: () => void
}

export function MetaForm({ open, onClose, editingId, onEditComplete }: MetaFormProps) {
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    urgencia: "media" as "baixa" | "media" | "alta",
    prazo: "",
    etapas: [] as string[],
    tags: [] as string[],
  })
  const [newEtapa, setNewEtapa] = useState("")
  const [newTag, setNewTag] = useState("")

  const editingMeta = editingId ? state.metas.find((m) => m.id === editingId) : null

  useEffect(() => {
    if (editingMeta) {
      setFormData({
        nome: editingMeta.nome,
        descricao: editingMeta.descricao,
        categoria: editingMeta.categoria,
        urgencia: editingMeta.urgencia,
        prazo: editingMeta.prazo.split("T")[0],
        etapas: editingMeta.etapas,
        tags: editingMeta.tags,
      })
    } else {
      setFormData({
        nome: "",
        descricao: "",
        categoria: "",
        urgencia: "media",
        prazo: "",
        etapas: [],
        tags: [],
      })
    }
  }, [editingMeta, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.descricao || !formData.prazo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, descrição e prazo",
        variant: "destructive",
      })
      return
    }

    const meta: Meta = {
      id: editingId || Date.now().toString(),
      nome: formData.nome,
      descricao: formData.descricao,
      categoria: formData.categoria || "Geral",
      urgencia: formData.urgencia,
      prazo: formData.prazo,
      etapas: formData.etapas,
      progresso: editingMeta?.progresso || 0,
      criadaEm: editingMeta?.criadaEm || new Date().toISOString(),
      tags: formData.tags,
    }

    if (editingId) {
      dispatch({ type: "UPDATE_META", payload: meta })
      toast({
        title: "Meta atualizada!",
        description: "Suas alterações foram salvas com sucesso.",
      })
      onEditComplete?.()
    } else {
      dispatch({ type: "ADD_META", payload: meta })
      dispatch({ type: "ADD_POINTS", payload: 10 })
      toast({
        title: "Meta criada!",
        description: "Sua nova meta foi adicionada. +10 pontos!",
      })
    }

    onClose()
  }

  const addEtapa = () => {
    if (newEtapa.trim()) {
      setFormData((prev) => ({
        ...prev,
        etapas: [...prev.etapas, newEtapa.trim()],
      }))
      setNewEtapa("")
    }
  }

  const removeEtapa = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      etapas: prev.etapas.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingId ? "Editar Meta" : "Nova Meta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Meta *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Aprender Python"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva sua meta em detalhes..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoria: e.target.value }))}
                placeholder="Ex: Estudos, Trabalho, Pessoal"
              />
            </div>

            <div>
              <Label htmlFor="urgencia">Urgência</Label>
              <Select
                value={formData.urgencia}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, urgencia: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="prazo">Prazo *</Label>
            <Input
              id="prazo"
              type="date"
              value={formData.prazo}
              onChange={(e) => setFormData((prev) => ({ ...prev, prazo: e.target.value }))}
            />
          </div>

          <div>
            <Label>Etapas</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newEtapa}
                onChange={(e) => setNewEtapa(e.target.value)}
                placeholder="Adicionar etapa..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEtapa())}
              />
              <Button type="button" onClick={addEtapa}>
                Adicionar
              </Button>
            </div>
            <div className="space-y-1">
              {formData.etapas.map((etapa, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">
                    {index + 1}. {etapa}
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeEtapa(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editingId ? "Atualizar" : "Criar"} Meta
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
