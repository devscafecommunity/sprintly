"use client"

import { useApp } from "@/contexts/AppContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#A28DFF", "#FF6B6B"]

export function ProgressCharts() {
  const { state } = useApp()

  // Dados reais para gráfico de barras - progresso por meta
  const progressData = state.metas.map((meta) => ({
    nome: meta.nome.length > 15 ? meta.nome.substring(0, 15) + "..." : meta.nome,
    progresso: meta.progresso,
    tarefas: state.tasks.filter((t) => t.metaId === meta.id).length,
    concluidas: state.tasks.filter((t) => t.metaId === meta.id && t.status === "done").length,
  }))

  // Dados reais para gráfico de pizza - distribuição por categoria
  const categoryData = state.metas.reduce(
    (acc, meta) => {
      const existing = acc.find((item) => item.categoria === meta.categoria)
      if (existing) {
        existing.quantidade += 1
      } else {
        acc.push({ categoria: meta.categoria, quantidade: 1 })
      }
      return acc
    },
    [] as { categoria: string; quantidade: number }[],
  )

  // Dados reais para gráfico de linha - tarefas por status
  const statusData = [
    { status: "Backlog", quantidade: state.tasks.filter((t) => t.status === "backlog").length },
    { status: "To Do", quantidade: state.tasks.filter((t) => t.status === "todo").length },
    { status: "Doing", quantidade: state.tasks.filter((t) => t.status === "doing").length },
    { status: "Done", quantidade: state.tasks.filter((t) => t.status === "done").length },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Gráfico de Progresso por Meta */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Progresso por Meta</CardTitle>
        </CardHeader>
        <CardContent>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "progresso" ? `${value}%` : value,
                    name === "progresso" ? "Progresso" : name === "tarefas" ? "Total de Tarefas" : "Tarefas Concluídas",
                  ]}
                />
                <Bar dataKey="progresso" fill="#3B82F6" name="progresso" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Crie algumas metas para ver o gráfico de progresso
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Metas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoria, quantidade }) => `${categoria}: ${quantidade}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Crie algumas metas para ver a distribuição por categoria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Status das Tarefas */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Distribuição de Tarefas por Status</CardTitle>
        </CardHeader>
        <CardContent>
          {state.tasks.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Crie algumas tarefas para ver a distribuição por status
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
