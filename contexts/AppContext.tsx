"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface Meta {
  id: string
  nome: string
  descricao: string
  categoria: string
  urgencia: "baixa" | "media" | "alta"
  prazo: string
  etapas: string[]
  progresso: number
  criadaEm: string
  tags: string[]
}

export interface Task {
  id: string
  metaId: string
  titulo: string
  descricao: string
  status: "backlog" | "todo" | "doing" | "done"
  criadaEm: string
  concluidaEm?: string
}

export interface Sprint {
  id: string
  nome: string
  duracao: number // dias
  inicioEm: string
  fimEm: string
  ativo: boolean
  metas: string[]
}

export interface Achievement {
  id: string
  nome: string
  descricao: string
  icone: string
  desbloqueadoEm?: string
}

interface AppState {
  metas: Meta[]
  tasks: Task[]
  sprints: Sprint[]
  achievements: Achievement[]
  sprintAtivo?: Sprint
  pomodoroAtivo: boolean
  pomodoroTempo: number // tempo restante em segundos
  pomodoroTotalFoco: number // tempo total de foco acumulado em segundos
  pomodoroIsBreak: boolean
  pontuacao: number
  nivel: number
  selectedMetaId: string | null
  settings: {
    theme: "light" | "dark" | "auto"
    pomodoroSound: boolean
    autoStartBreaks: boolean
    showCompletedTasks: boolean
    autoUpdateProgress: boolean
  }
}

type AppAction =
  | { type: "ADD_META"; payload: Meta }
  | { type: "UPDATE_META"; payload: Meta }
  | { type: "DELETE_META"; payload: string }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "MOVE_TASK"; payload: { taskId: string; newStatus: Task["status"] } }
  | { type: "START_SPRINT"; payload: Sprint }
  | { type: "END_SPRINT"; payload: string }
  | { type: "START_POMODORO"; payload?: { isBreak?: boolean } }
  | { type: "STOP_POMODORO" }
  | { type: "TICK_POMODORO" }
  | { type: "ADD_POINTS"; payload: number }
  | { type: "UNLOCK_ACHIEVEMENT"; payload: string }
  | { type: "IMPORT_DATA"; payload: { metas: Meta[]; tasks: Task[] } }
  | { type: "SET_SELECTED_META"; payload: string | null }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppState["settings"]> }
  | { type: "SET_INITIAL_STATE"; payload: AppState }

const initialState: AppState = {
  metas: [],
  tasks: [],
  sprints: [],
  achievements: [
    { id: "primeira-meta", nome: "Primeira Meta", descricao: "Criou sua primeira meta", icone: "🎯" },
    { id: "cinco-tarefas", nome: "Consistente", descricao: "Completou 5 tarefas", icone: "🔥" },
    { id: "sprint-master", nome: "Sprint Master", descricao: "Completou seu primeiro sprint", icone: "🏃‍♂️" },
    { id: "foco-total", nome: "Foco Total", descricao: "Acumulou 2 horas de Pomodoro", icone: "🍅" },
  ],
  pomodoroAtivo: false,
  pomodoroTempo: 25 * 60, // 25 minutos em segundos
  pomodoroTotalFoco: 0,
  pomodoroIsBreak: false,
  pontuacao: 0,
  nivel: 1,
  selectedMetaId: null,
  settings: {
    theme: "light",
    pomodoroSound: true,
    autoStartBreaks: false,
    showCompletedTasks: true,
    autoUpdateProgress: true,
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_INITIAL_STATE":
      return { ...action.payload }

    case "ADD_META":
      const newMeta = action.payload
      const updatedAchievementsAddMeta = [...state.achievements]
      if (!updatedAchievementsAddMeta.find((a) => a.id === "primeira-meta")?.desbloqueadoEm) {
        updatedAchievementsAddMeta.find((a) => a.id === "primeira-meta")!.desbloqueadoEm = new Date().toISOString()
      }
      return { ...state, metas: [...state.metas, newMeta], achievements: updatedAchievementsAddMeta }

    case "UPDATE_META":
      return {
        ...state,
        metas: state.metas.map((meta) => (meta.id === action.payload.id ? action.payload : meta)),
      }

    case "DELETE_META":
      return {
        ...state,
        metas: state.metas.filter((meta) => meta.id !== action.payload),
        tasks: state.tasks.filter((task) => task.metaId !== action.payload),
      }

    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] }

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.payload.id ? action.payload : task)),
      }

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      }

    case "MOVE_TASK":
      const updatedTasks = state.tasks.map((task) =>
        task.id === action.payload.taskId
          ? {
              ...task,
              status: action.payload.newStatus,
              concluidaEm: action.payload.newStatus === "done" ? new Date().toISOString() : undefined,
            }
          : task,
      )

      // Check for "Consistente" achievement
      const completedTasksCount = updatedTasks.filter((t) => t.status === "done").length
      const updatedAchievementsMoveTask = [...state.achievements]
      if (
        completedTasksCount >= 5 &&
        !updatedAchievementsMoveTask.find((a) => a.id === "cinco-tarefas")?.desbloqueadoEm
      ) {
        updatedAchievementsMoveTask.find((a) => a.id === "cinco-tarefas")!.desbloqueadoEm = new Date().toISOString()
      }

      return {
        ...state,
        tasks: updatedTasks,
        achievements: updatedAchievementsMoveTask,
      }

    case "START_SPRINT":
      const newSprint = action.payload
      const updatedAchievementsStartSprint = [...state.achievements]
      if (!updatedAchievementsStartSprint.find((a) => a.id === "sprint-master")?.desbloqueadoEm) {
        updatedAchievementsStartSprint.find((a) => a.id === "sprint-master")!.desbloqueadoEm = new Date().toISOString()
      }
      return {
        ...state,
        sprints: [...state.sprints, newSprint],
        sprintAtivo: newSprint,
        achievements: updatedAchievementsStartSprint,
      }

    case "END_SPRINT":
      return {
        ...state,
        sprints: state.sprints.map((sprint) => (sprint.id === action.payload ? { ...sprint, ativo: false } : sprint)),
        sprintAtivo: undefined,
      }

    case "START_POMODORO":
      return {
        ...state,
        pomodoroAtivo: true,
        pomodoroIsBreak: action.payload?.isBreak || false,
        pomodoroTempo: action.payload?.isBreak ? 5 * 60 : 25 * 60,
      }

    case "STOP_POMODORO":
      return { ...state, pomodoroAtivo: false, pomodoroTempo: 25 * 60, pomodoroIsBreak: false }

    case "TICK_POMODORO":
      const newPomodoroTempo = Math.max(0, state.pomodoroTempo - 1)
      const newPomodoroTotalFoco = state.pomodoroIsBreak ? state.pomodoroTotalFoco : state.pomodoroTotalFoco + 1 // Only add to focus time if not a break

      const updatedAchievementsTick = [...state.achievements]
      if (
        newPomodoroTotalFoco >= 2 * 60 * 60 && // 2 hours
        !updatedAchievementsTick.find((a) => a.id === "foco-total")?.desbloqueadoEm
      ) {
        updatedAchievementsTick.find((a) => a.id === "foco-total")!.desbloqueadoEm = new Date().toISOString()
      }

      return {
        ...state,
        pomodoroTempo: newPomodoroTempo,
        pomodoroTotalFoco: newPomodoroTotalFoco,
        pomodoroAtivo: newPomodoroTempo > 0,
        achievements: updatedAchievementsTick,
      }

    case "ADD_POINTS":
      const newPoints = state.pontuacao + action.payload
      const newLevel = Math.floor(newPoints / 100) + 1
      return {
        ...state,
        pontuacao: newPoints,
        nivel: newLevel,
      }

    case "UNLOCK_ACHIEVEMENT":
      return {
        ...state,
        achievements: state.achievements.map((ach) =>
          ach.id === action.payload && !ach.desbloqueadoEm ? { ...ach, desbloqueadoEm: new Date().toISOString() } : ach,
        ),
      }

    case "IMPORT_DATA":
      // Ensure imported IDs are unique to avoid conflicts with existing data
      const importedMetas = action.payload.metas.map((meta) => ({
        ...meta,
        id: meta.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
      }))
      const importedTasks = action.payload.tasks.map((task) => ({
        ...task,
        id: task.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
      }))
      return {
        ...state,
        metas: [...state.metas, ...importedMetas],
        tasks: [...state.tasks, ...importedTasks],
      }

    case "SET_SELECTED_META":
      return { ...state, selectedMetaId: action.payload }

    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } }

    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Persistir dados no localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("sprintly-data")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        // Merge saved data with initial state to ensure all fields exist
        dispatch({ type: "SET_INITIAL_STATE", payload: { ...initialState, ...parsedData } })
      } catch (e) {
        console.error("Failed to parse saved data from localStorage:", e)
        // Fallback to initial state if parsing fails
        dispatch({ type: "SET_INITIAL_STATE", payload: initialState })
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "sprintly-data",
      JSON.stringify({
        metas: state.metas,
        tasks: state.tasks,
        sprints: state.sprints,
        pontuacao: state.pontuacao,
        nivel: state.nivel,
        achievements: state.achievements,
        pomodoroTotalFoco: state.pomodoroTotalFoco,
        settings: state.settings,
      }),
    )
  }, [state])

  // Aplicar tema
  useEffect(() => {
    const root = document.documentElement
    if (state.settings.theme === "dark") {
      root.classList.add("dark")
    } else if (state.settings.theme === "light") {
      root.classList.remove("dark")
    } else {
      // 'auto' based on system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }, [state.settings.theme])

  // Timer do Pomodoro
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (state.pomodoroAtivo && state.pomodoroTempo > 0) {
      interval = setInterval(() => {
        dispatch({ type: "TICK_POMODORO" })
      }, 1000)
    } else if (state.pomodoroAtivo && state.pomodoroTempo === 0) {
      // Timer finished
      if (state.settings.pomodoroSound) {
        const audio = new Audio("/sounds/ding.mp3") // Make sure you have a sound file here
        audio.play().catch((e) => console.error("Error playing sound:", e))
      }
      dispatch({ type: "STOP_POMODORO" }) // Stop and reset for now
      // If autoStartBreaks was true, we would start a break timer here
    }
    return () => clearInterval(interval)
  }, [state.pomodoroAtivo, state.pomodoroTempo, state.settings.pomodoroSound])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
