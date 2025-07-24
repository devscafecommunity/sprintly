import type React from "react"
import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      {" "}
      {/* Changed bg-gray-50 to bg-background */}
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
