"use client"
import { Shield, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const menuItems = [
  { icon: Shield, label: "Habits", active: true },
  { icon: Settings, label: "Settings", active: false },
]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("Habits")

  return (
    <aside className="fixed left-0 top-0 h-screen w-48 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">LockIn AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = item.label === activeItem
          return (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-xs">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">User</p>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">user@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
