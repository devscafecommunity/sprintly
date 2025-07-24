"use client"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, Sparkles, Calendar, Tag } from "lucide-react"
import { MetaForm } from "@/components/MetaForm"
import { ImportDialog } from "@/components/ImportDialog"
import { AIRoadmapDialog } from "@/components/AIRoadmapDialog"

export default function MetasPage() {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [editingMeta, setEditingMeta] = useState<string | null>(null)

  const handleDeleteMeta = (id: string) => {
    dispatch({ type: "DELETE_META", payload: id })
  }

  const getUrgencyColor = (urgencia: string) => {
    switch (urgencia) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      case "baixa":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Suas Metas</h1>
        <p className="text-gray-600">Transforme ideias em planos compartilháveis</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
        <Button variant="outline" onClick={() => setShowImport(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Importar
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAI(true)}
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Gerar com IA
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {state.metas.map((meta) => (
          <Card key={meta.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{meta.nome}</CardTitle>
                  <CardDescription className="mt-1">{meta.descricao}</CardDescription>
                </div>
                <Badge className={getUrgencyColor(meta.urgencia)}>{meta.urgencia}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(meta.prazo).toLocaleDateString("pt-BR")}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Tag className="w-4 h-4 mr-2" />
                  {meta.categoria}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${meta.progresso}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{meta.progresso}% concluído</p>

                {meta.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {meta.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingMeta(meta.id)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteMeta(meta.id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {state.metas.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta criada ainda</h3>
          <p className="text-gray-600 mb-4">Comece criando sua primeira meta ou importe de um arquivo</p>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar primeira meta
          </Button>
        </div>
      )}

      <MetaForm
        open={showForm}
        onClose={() => setShowForm(false)}
        editingId={editingMeta}
        onEditComplete={() => setEditingMeta(null)}
      />

      <ImportDialog open={showImport} onClose={() => setShowImport(false)} />

      <AIRoadmapDialog open={showAI} onClose={() => setShowAI(false)} />
    </div>
  )
}
