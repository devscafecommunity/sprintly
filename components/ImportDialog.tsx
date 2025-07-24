"use client"

import type React from "react"

import { useState } from "react"
import { useApp, type Meta, type Task } from "@/contexts/AppContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface ImportDialogProps {
  open: boolean
  onClose: () => void
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const { dispatch, state } = useApp()
  const { toast } = useToast()
  const [importData, setImportData] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const parseData = (data: string, format: "json" | "markdown" | "csv"): { metas: Meta[]; tasks: Task[] } => {
    const parsedMetas: Meta[] = []
    const parsedTasks: Task[] = []

    if (format === "json") {
      try {
        const parsed = JSON.parse(data)
        const metasToParse = Array.isArray(parsed) ? parsed : [parsed]

        metasToParse.forEach((item: any, metaIndex: number) => {
          // Generate a unique ID for the meta
          const metaId = `meta-${Date.now()}-${metaIndex}-${Math.random().toString(36).substring(2, 9)}`
          const newMeta: Meta = {
            id: metaId,
            nome: item.meta || item.nome || item.name || "Meta Importada",
            descricao: item.descricao || item.description || "Descrição importada",
            categoria: item.categoria || item.category || "Importado",
            urgencia: item.urgencia || item.urgency || "media",
            prazo:
              item.prazo ||
              item.deadline ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            etapas: item.etapas || item.steps || [],
            progresso: item.progresso || item.progress || 0,
            criadaEm: new Date().toISOString(),
            tags: item.tags || [],
          }
          parsedMetas.push(newMeta)

          if (item.tarefas && Array.isArray(item.tarefas)) {
            item.tarefas.forEach((taskItem: any, taskIndex: number) => {
              const taskId = `task-${Date.now()}-${metaIndex}-${taskIndex}-${Math.random().toString(36).substring(2, 9)}`
              const newTask: Task = {
                id: taskId,
                metaId: metaId, // Link task to the newly created meta ID
                titulo: taskItem.titulo || taskItem.title || taskItem.task || "Tarefa Importada",
                descricao: taskItem.descricao || taskItem.description || "",
                status: "backlog",
                criadaEm: new Date().toISOString(),
              }
              parsedTasks.push(newTask)
            })
          }
        })
      } catch (error) {
        throw new Error("Formato JSON inválido: " + (error as Error).message)
      }
    } else if (format === "markdown") {
      const lines = data.split("\n")
      let currentMeta: Partial<Meta> | null = null
      let currentMetaId: string | null = null

      lines.forEach((line) => {
        line = line.trim()

        if (line.startsWith("# ")) {
          // New Meta
          if (currentMeta && currentMetaId) {
            parsedMetas.push({
              id: currentMetaId,
              nome: currentMeta.nome || "Meta Importada",
              descricao: currentMeta.descricao || "Descrição importada",
              categoria: currentMeta.categoria || "Importado",
              urgencia: currentMeta.urgencia || "media",
              prazo: currentMeta.prazo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              etapas: currentMeta.etapas || [],
              progresso: 0,
              criadaEm: new Date().toISOString(),
              tags: currentMeta.tags || [],
            })
          }
          currentMetaId = `meta-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          currentMeta = { nome: line.substring(2), etapas: [] }
        } else if (line.startsWith("- ") && currentMeta && currentMetaId) {
          // Meta Etapa or Task
          const content = line.substring(2)
          if (content.startsWith("[ ] ") || content.startsWith("[x] ")) {
            // This is a task
            const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            parsedTasks.push({
              id: taskId,
              metaId: currentMetaId, // Link task to the current meta ID
              titulo: content.replace(/\[[ x]\] /, ""),
              descricao: "",
              status: "backlog",
              criadaEm: new Date().toISOString(),
            })
          } else {
            // This is an etapa
            if (!currentMeta.etapas) currentMeta.etapas = []
            currentMeta.etapas.push(content)
          }
        } else if (line && currentMeta && !currentMeta.descricao) {
          currentMeta.descricao = line
        }
      })

      if (currentMeta && currentMetaId) {
        parsedMetas.push({
          id: currentMetaId,
          nome: currentMeta.nome || "Meta Importada",
          descricao: currentMeta.descricao || "Descrição importada",
          categoria: currentMeta.categoria || "Importado",
          urgencia: currentMeta.urgencia || "media",
          prazo: currentMeta.prazo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          etapas: currentMeta.etapas || [],
          progresso: 0,
          criadaEm: new Date().toISOString(),
          tags: currentMeta.tags || [],
        })
      }
    } else if (format === "csv") {
      const lines = data.split("\n").filter((line) => line.trim())
      if (lines.length < 2) throw new Error("CSV deve ter pelo menos cabeçalho e uma linha de dados")

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        const meta: Partial<Meta> = {}
        const tasksForMeta: Partial<Task>[] = []

        headers.forEach((header, index) => {
          const value = values[index] || ""
          switch (header) {
            case "nome":
            case "name":
              meta.nome = value
              break
            case "descricao":
            case "description":
              meta.descricao = value
              break
            case "categoria":
            case "category":
              meta.categoria = value
              break
            case "urgencia":
            case "urgency":
              meta.urgencia = value as any
              break
            case "prazo":
            case "deadline":
              meta.prazo = value
              break
            case "etapas":
            case "steps":
              meta.etapas = value ? value.split(";") : []
              break
            case "tarefas":
            case "tasks":
              if (value) {
                value.split(";").forEach((taskTitle) => {
                  tasksForMeta.push({ titulo: taskTitle })
                })
              }
              break
          }
        })

        const metaId = `meta-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`
        parsedMetas.push({
          id: metaId,
          nome: meta.nome || "Meta Importada",
          descricao: meta.descricao || "Descrição importada",
          categoria: meta.categoria || "Importado",
          urgencia: meta.urgencia || "media",
          prazo: meta.prazo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          etapas: meta.etapas || [],
          progresso: 0,
          criadaEm: new Date().toISOString(),
          tags: [],
        })

        tasksForMeta.forEach((taskItem, taskIndex) => {
          const taskId = `task-${Date.now()}-${i}-${taskIndex}-${Math.random().toString(36).substring(2, 9)}`
          parsedTasks.push({
            id: taskId,
            metaId: metaId, // Link task to the newly created meta ID
            titulo: taskItem.titulo || "Tarefa Importada",
            descricao: taskItem.descricao || "",
            status: "backlog",
            criadaEm: new Date().toISOString(),
          })
        })
      }
    }

    return { metas: parsedMetas, tasks: parsedTasks }
  }

  const handleImport = (format: "json" | "markdown" | "csv") => {
    try {
      const { metas, tasks } = parseData(importData, format)

      if (metas.length === 0 && tasks.length === 0) {
        throw new Error("Nenhuma meta ou tarefa encontrada nos dados")
      }

      dispatch({ type: "IMPORT_DATA", payload: { metas, tasks } })
      dispatch({ type: "ADD_POINTS", payload: metas.length * 5 + tasks.length * 2 })

      toast({
        title: "Importação concluída!",
        description: `${metas.length} meta(s) e ${tasks.length} tarefa(s) importada(s) com sucesso. +${
          metas.length * 5 + tasks.length * 2
        } pontos!`,
      })

      setImportData("")
      onClose()
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, format: "json" | "markdown" | "csv") => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImportData(e.target?.result as string)
        // Automatically try to import after file load
        // handleImport(format) // Removed auto-import to allow user to review data
      }
      reader.readAsText(selectedFile)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Metas e Tarefas</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="json" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="csv">CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-4">
            <div>
              <Label>Exemplo de formato JSON (meta com tarefas aninhadas):</Label>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto text-muted-foreground">
                {`{
"nome": "Aprender Python",
"descricao": "Dominar programação Python",
"prazo": "2025-12-01",
"categoria": "Estudos",
"tarefas": [
  {"titulo": "Estudar variáveis", "descricao": "Aprender sobre tipos de dados"},
  {"titulo": "Fazer exercícios", "descricao": "Praticar loops"}
]
}`}
              </pre>
            </div>
            <div>
              <Label htmlFor="json-data">Cole seus dados JSON ou faça upload:</Label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => handleFileUpload(e, "json")}
                className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <Textarea
                id="json-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Cole aqui seus dados JSON..."
                rows={8}
              />
            </div>
            <Button onClick={() => handleImport("json")} disabled={!importData.trim()}>
              Importar JSON
            </Button>
          </TabsContent>

          <TabsContent value="markdown" className="space-y-4">
            <div>
              <Label>Exemplo de formato Markdown (meta com tarefas aninhadas):</Label>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto text-muted-foreground">
                {`# Aprender Python
Dominar programação Python para desenvolvimento web
- [ ] Estudar variáveis e tipos de dados
- [ ] Estruturas de controle
- [ ] Funções e módulos

# Criar um blog
Desenvolver um blog pessoal
- [ ] Escolher plataforma
- [ ] Definir design
- [ ] Escrever primeiro post`}
              </pre>
            </div>
            <div>
              <Label htmlFor="md-data">Cole seus dados Markdown ou faça upload:</Label>
              <input
                type="file"
                accept=".md,.txt"
                onChange={(e) => handleFileUpload(e, "markdown")}
                className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <Textarea
                id="md-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Cole aqui seus dados Markdown..."
                rows={8}
              />
            </div>
            <Button onClick={() => handleImport("markdown")} disabled={!importData.trim()}>
              Importar Markdown
            </Button>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <div>
              <Label>Exemplo de formato CSV (meta com tarefas aninhadas):</Label>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto text-muted-foreground">
                {`nome,descricao,categoria,prazo,tarefas
Aprender Python,Dominar programação Python,Estudos,2025-12-01,"Estudar variáveis;Fazer exercícios"
Criar blog,Desenvolver blog pessoal,Projetos,2025-06-01,"Escolher plataforma;Definir design"`}
              </pre>
            </div>
            <div>
              <Label htmlFor="csv-data">Cole seus dados CSV ou faça upload:</Label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, "csv")}
                className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <Textarea
                id="csv-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Cole aqui seus dados CSV..."
                rows={8}
              />
            </div>
            <Button onClick={() => handleImport("csv")} disabled={!importData.trim()}>
              Importar CSV
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
