"use client"

import { useApp } from "@/contexts/AppContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Square, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function PomodoroTimer() {
  const { state, dispatch } = useApp()
  const { toast } = useToast()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    dispatch({ type: "START_POMODORO" })
    toast({
      title: "Pomodoro iniciado!",
      description: "Foque na sua tarefa por 25 minutos.",
    })
  }

  const handleStop = () => {
    dispatch({ type: "STOP_POMODORO" })
    if (state.pomodoroTempo === 0 && !state.pomodoroIsBreak) {
      // Only add points if it was a work session that finished
      dispatch({ type: "ADD_POINTS", payload: 10 })
      toast({
        title: "Pomodoro concluído! 🍅",
        description: "Parabéns! Faça uma pausa de 5 minutos. +10 pontos!",
      })
    } else if (state.pomodoroIsBreak && state.pomodoroTempo === 0) {
      toast({
        title: "Pausa concluída!",
        description: "Hora de voltar ao trabalho!",
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-orange-600" />
          Modo Foco - Pomodoro
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="text-6xl font-mono font-bold text-orange-600 mb-4">{formatTime(state.pomodoroTempo)}</div>

        <div className="flex gap-2 justify-center">
          {!state.pomodoroAtivo ? (
            <Button onClick={handleStart} className="bg-orange-600 hover:bg-orange-700">
              <Play className="w-4 h-4 mr-2" />
              Iniciar Foco
            </Button>
          ) : (
            <Button onClick={handleStop} variant="outline">
              <Square className="w-4 h-4 mr-2" />
              Parar
            </Button>
          )}
          {state.pomodoroAtivo && state.pomodoroIsBreak && (
            <Button
              onClick={() => dispatch({ type: "START_POMODORO", payload: { isBreak: false } })}
              variant="secondary"
            >
              Voltar ao Foco
            </Button>
          )}
          {state.pomodoroAtivo && !state.pomodoroIsBreak && (
            <Button
              onClick={() => dispatch({ type: "START_POMODORO", payload: { isBreak: true } })}
              variant="secondary"
            >
              Iniciar Pausa
            </Button>
          )}
        </div>

        <p className="text-sm text-gray-600 mt-4">
          {state.pomodoroAtivo
            ? state.pomodoroIsBreak
              ? "Pausa! Relaxe por 5 minutos."
              : "Mantenha o foco! Você consegue!"
            : "25 minutos de foco intenso"}
        </p>
      </CardContent>
    </Card>
  )
}
