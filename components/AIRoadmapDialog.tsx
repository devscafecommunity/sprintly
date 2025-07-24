"use client"

import { useState } from "react"
import { useApp, type Meta } from "@/contexts/AppContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIRoadmapDialogProps {
  open: boolean
  onClose: () => void
}

export function AIRoadmapDialog({ open, onClose }: AIRoadmapDialogProps) {
  const { dispatch } = useApp()
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)

  // Simulação de geração de roadmap com IA
  const generateRoadmap = async () => {
    setLoading(true)

    try {
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Gerar roadmap baseado no prompt
      const roadmapTemplates = {
        python: {
          nome: "Aprender Python",
          descricao: "Dominar programação Python do básico ao avançado",
          categoria: "Programação",
          etapas: [
            "Sintaxe básica e variáveis",
            "Estruturas de controle (if, for, while)",
            "Funções e módulos",
            "Programação orientada a objetos",
            "Manipulação de arquivos",
            "Bibliotecas populares (requests, pandas)",
            "Frameworks web (Flask/Django)",
            "Projeto prático",
          ],
        },
        youtube: {
          nome: "Criar canal no YouTube",
          descricao: "Desenvolver um canal de sucesso no YouTube",
          categoria: "Criação de Conteúdo",
          etapas: [
            "Definir nicho e público-alvo",
            "Criar identidade visual",
            "Configurar canal e otimizar SEO",
            "Planejar primeiros 10 vídeos",
            "Aprender edição básica",
            "Criar cronograma de publicação",
            "Estratégias de engajamento",
            "Monetização e parcerias",
          ],
        },
        concurso: {
          nome: "Estudar para concurso público",
          descricao: "Preparação completa para concurso público",
          categoria: "Estudos",
          etapas: [
            "Análise do edital",
            "Cronograma de estudos",
            "Português e redação",
            "Matemática e raciocínio lógico",
            "Conhecimentos específicos",
            "Legislação aplicável",
            "Simulados e provas anteriores",
            "Revisão final",
          ],
        },
      }

      // Detectar tipo de meta baseado no prompt
      const promptLower = prompt.toLowerCase()
      let template = roadmapTemplates["python"] // default

      if (promptLower.includes("python") || promptLower.includes("programação")) {
        template = roadmapTemplates["python"]
      } else if (promptLower.includes("youtube") || promptLower.includes("canal") || promptLower.includes("vídeo")) {
        template = roadmapTemplates["youtube"]
      } else if (promptLower.includes("concurso") || promptLower.includes("público")) {
        template = roadmapTemplates["concurso"]
      } else {
        // Gerar template genérico baseado no prompt
        template = {
          nome: prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt,
          descricao: `Roadmap gerado por IA para: ${prompt}`,
          categoria: "IA Gerada",
          etapas: [
            "Pesquisa e planejamento inicial",
            "Definir objetivos específicos",
            "Criar cronograma detalhado",
            "Executar primeira fase",
            "Avaliar progresso e ajustar",
            "Implementar melhorias",
            "Finalizar e documentar",
            "Celebrar conquista",
          ],
        }
      }

      const meta: Meta = {
        id: Date.now().toString(),
        nome: template.nome,
        descricao: template.descricao,
        categoria: template.categoria,
        urgencia: "media",
        prazo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 90 dias
        etapas: template.etapas,
        progresso: 0,
        criadaEm: new Date().toISOString(),
        tags: ["IA", "Roadmap"],
      }

      dispatch({ type: "ADD_META", payload: meta })
      dispatch({ type: "ADD_POINTS", payload: 15 })

      toast({
        title: "Roadmap gerado!",
        description: "Sua meta foi criada com sucesso usando IA. +15 pontos!",
      })

      setPrompt("")
      onClose()
    } catch (error) {
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar o roadmap. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Gerar Roadmap com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="prompt">Descreva sua meta ou objetivo:</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Quero aprender Python para desenvolvimento web, criar um canal no YouTube sobre tecnologia, estudar para concurso público..."
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">💡 Dicas para melhores resultados:</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Seja específico sobre seu objetivo</li>
              <li>• Mencione seu nível atual de conhecimento</li>
              <li>• Inclua prazos ou urgência se relevante</li>
              <li>• Descreva o resultado final desejado</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateRoadmap}
              disabled={!prompt.trim() || loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Roadmap
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
