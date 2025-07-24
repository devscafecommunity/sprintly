import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, TrendingUp, Zap, Brain, Trophy } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Sprintly</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Começar Agora</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transforme <span className="text-blue-600">ideias</span> em{" "}
            <span className="text-purple-600">planos compartilháveis</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Uma plataforma baseada em ciência comportamental que combina gerenciamento de metas, progresso visual e uma
            rede social de apoio para maximizar sua produtividade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Criar Conta Gratuita
              </Button>
            </Link>
            <Link href="/sobre">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                Saiba Mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades Principais</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Target className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Definição de Metas</CardTitle>
                <CardDescription>
                  Crie metas detalhadas com IA integrada para gerar roadmaps automáticos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Importação via JSON, Markdown, XML, CSV</li>
                  <li>• Templates prontos para diferentes objetivos</li>
                  <li>• Geração de roadmaps com OpenAI</li>
                  <li>• Organização hierárquica e tags</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Progresso Visual</CardTitle>
                <CardDescription>Acompanhe seu crescimento com Kanban, gráficos e sistema de sprints</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Quadro Kanban interativo</li>
                  <li>• Gráficos de progresso em tempo real</li>
                  <li>• Sistema de sprints personalizáveis</li>
                  <li>• Timer Pomodoro integrado</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Rede Social</CardTitle>
                <CardDescription>Compartilhe metas e receba apoio de uma comunidade focada</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Feed de metas públicas</li>
                  <li>• Comentários curtos e construtivos</li>
                  <li>• Grupos temáticos de foco</li>
                  <li>• Sistema de recompensas e badges</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Science-Based Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Baseado em Ciência Comportamental</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Utilizamos princípios comprovados de psicologia para maximizar suas chances de sucesso
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Zap className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Intenção de Implementação</h3>
              <p className="text-sm text-gray-600">Lembretes contextuais que conectam situações específicas a ações</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Visualização do Processo</h3>
              <p className="text-sm text-gray-600">Timelines e animações que mostram sua jornada de progresso</p>
            </div>
            <div className="text-center">
              <Trophy className="h-10 w-10 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Gamificação Inteligente</h3>
              <p className="text-sm text-gray-600">Recompensas baseadas em consistência e marcos reais</p>
            </div>
            <div className="text-center">
              <Users className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Accountability Social</h3>
              <p className="text-sm text-gray-600">Compromisso público que aumenta a motivação e persistência</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para transformar suas metas em realidade?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Junte-se a milhares de pessoas que já estão alcançando seus objetivos com o Sprintly
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              Começar Gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-50 border-t">
        <div className="container mx-auto text-center text-gray-600">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Target className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">Sprintly</span>
          </div>
          <p>&copy; 2025 Sprintly. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
