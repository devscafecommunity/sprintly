"use client"

import type React from "react"

import { useState } from "react"
import { useApp, type Sprint } from "@/contexts/AppContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface SprintDialogProps {
  open: boolean
  onClose: () => void
}

export function SprintDialog({ open, onClose }: SprintDialogProps) {
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nome: "",
    duracao: 7,
    metasSelecionadas: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o sprint",
        variant: "destructive",
      })
      return
    }

    const inicioEm = new Date()
    const fimEm = new Date(inicioEm.getTime() + formData.duracao * 24 * 60 * 60 * 1000)

    const sprint: Sprint = {
      id: Date.now().toString(),
      nome: formData.nome,
      duracao: formData.duracao,
      inicioEm: inicioEm.toISOString(),
      fimEm: fimEm.toISOString(),
      ativo: true,
      metas: formData.metasSelecionadas,
    }

    dispatch({ type: "START_SPRINT", payload: sprint })
    dispatch({ type: "ADD_POINTS", payload: 20 })

    toast({
      title: "Sprint iniciado!",
      description: `Sprint "${formData.nome}" criado com sucesso. +20 pontos!`,
    })

    setFormData({ nome: "", duracao: 7, metasSelecionadas: [] })
    onClose()
  }

  const handleMetaToggle = (metaId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      metasSelecionadas: checked
        ? [...prev.metasSelecionadas, metaId]
        : prev.metasSelecionadas.filter((id) => id !== metaId),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Sprint</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Sprint *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Sprint de Janeiro, Foco em Python..."
            />
          </div>

          <div>
            <Label htmlFor="duracao">Duração</Label>
            <Select
              value={formData.duracao.toString()}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, duracao: Number.parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias (1 semana)</SelectItem>
                <SelectItem value="14">14 dias (2 semanas)</SelectItem>
                <SelectItem value="30">30 dias (1 mês)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Metas do Sprint</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-3">
              {state.metas.map((meta) => (
                <div key={meta.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={meta.id}
                    checked={formData.metasSelecionadas.includes(meta.id)}
                    onCheckedChange={(checked) => handleMetaToggle(meta.id, checked as boolean)}
                  />
                  <Label htmlFor={meta.id} className="text-sm">
                    {meta.nome} ({meta.progresso}% concluído)
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Dicas para um Sprint eficaz:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Selecione metas relacionadas ou complementares</li>
              <li>• Defina objetivos realistas para o período</li>
              <li>• Mantenha foco nas metas selecionadas</li>
              <li>• Revise o progresso diariamente</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Iniciar Sprint
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
