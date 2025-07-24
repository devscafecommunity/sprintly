"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Palette, Download, Upload, Trash2, Volume2, CheckSquare } from "lucide-react"
import { useApp } from "@/contexts/AppContext"
import { useToast } from "@/hooks/use-toast"

export default function ConfigPage() {
  const { state, dispatch } = useApp()
  const { toast } = useToast()

  const handleSettingChange = (key: keyof typeof state.settings, value: any) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: { [key]: value } })
  }

  const exportData = () => {
    const data = {
      metas: state.metas,
      tasks: state.tasks,
      sprints: state.sprints,
      pontuacao: state.pontuacao,
      nivel: state.nivel,
      achievements: state.achievements,
      pomodoroTotalFoco: state.pomodoroTotalFoco,
      settings: state.settings,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sprintly-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Dados exportados!",
      description: "Backup criado com sucesso.",
    })
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          // Validate and set initial state
          if (data.metas && data.tasks && data.achievements && data.settings) {
            dispatch({ type: "SET_INITIAL_STATE", payload: data })
            toast({
              title: "Dados importados!",
              description: "Backup restaurado com sucesso.",
            })
          } else {
            throw new Error("Estrutura de backup inválida.")
          }
        } catch (error) {
          toast({
            title: "Erro na importação",
            description: error instanceof Error ? error.message : "Arquivo de backup inválido.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const clearAllData = () => {
    if (confirm("Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.")) {
      localStorage.removeItem("sprintly-data")
      window.location.reload() // Recarrega a página para resetar o estado
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Configurações</h1>
        <p className="text-gray-600">Personalize sua experiência no Sprintly</p>
      </div>

      <div className="space-y-6">
        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Aparência e Interface
            </CardTitle>
            <CardDescription>Personalize a interface do aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme">Tema</Label>
              <Select
                value={state.settings.theme}
                onValueChange={(value: "light" | "dark" | "auto") => handleSettingChange("theme", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="auto">Automático do Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-completed">Mostrar tarefas concluídas no Kanban</Label>
                <p className="text-sm text-gray-600">Exibir tarefas na coluna "Done"</p>
              </div>
              <Switch
                id="show-completed"
                checked={state.settings.showCompletedTasks}
                onCheckedChange={(checked) => handleSettingChange("showCompletedTasks", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-progress">Atualização automática de progresso</Label>
                <p className="text-sm text-gray-600">Atualizar progresso das metas ao concluir tarefas</p>
              </div>
              <Switch
                id="auto-progress"
                checked={state.settings.autoUpdateProgress}
                onCheckedChange={(checked) => handleSettingChange("autoUpdateProgress", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pomodoro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Configurações do Pomodoro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pomodoro-sound">Som de notificação</Label>
                <p className="text-sm text-gray-600">Tocar som quando o timer acabar</p>
              </div>
              <Switch
                id="pomodoro-sound"
                checked={state.settings.pomodoroSound}
                onCheckedChange={(checked) => handleSettingChange("pomodoroSound", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-breaks">Pausas automáticas</Label>
                <p className="text-sm text-gray-600">Iniciar pausa automaticamente após o foco (não implementado)</p>
              </div>
              <Switch
                id="auto-breaks"
                checked={state.settings.autoStartBreaks}
                onCheckedChange={(checked) => handleSettingChange("autoStartBreaks", checked)}
                disabled // Desabilitado pois a funcionalidade completa de auto-pausa não está implementada
              />
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Suas Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{state.metas.length}</div>
                <div className="text-sm text-gray-600">Metas criadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {state.tasks.filter((t) => t.status === "done").length}
                </div>
                <div className="text-sm text-gray-600">Tarefas concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{state.pontuacao}</div>
                <div className="text-sm text-gray-600">Pontos totais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{state.nivel}</div>
                <div className="text-sm text-gray-600">Nível atual</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Suas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg ${
                    achievement.desbloqueadoEm ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="text-2xl">{achievement.icone}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.nome}</h4>
                    <p className="text-sm text-gray-600">{achievement.descricao}</p>
                  </div>
                  <Badge variant={achievement.desbloqueadoEm ? "default" : "secondary"}>
                    {achievement.desbloqueadoEm ? "Desbloqueado" : "Bloqueado"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dados */}
        <Card>
          <CardHeader>
            <CardTitle>💾 Gerenciar Dados</CardTitle>
            <CardDescription>Faça backup ou restaure seus dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={exportData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </Button>
              <div>
                <input type="file" accept=".json" onChange={importData} className="hidden" id="import-file" />
                <Button variant="outline" onClick={() => document.getElementById("import-file")?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Backup
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <Button onClick={clearAllData} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Todos os Dados
              </Button>
              <p className="text-sm text-gray-600 mt-2">⚠️ Esta ação não pode ser desfeita. Faça um backup antes.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
