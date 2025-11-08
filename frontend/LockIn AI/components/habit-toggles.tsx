"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const HABITS = [
  { id: "nail-biting", label: "Nail Biting" },
  { id: "yawning", label: "Yawning" },
  { id: "nose-picking", label: "Nose Picking" },
]

export function HabitToggles() {
  const [enabledHabits, setEnabledHabits] = useState<Record<string, boolean>>({
    "nail-biting": true,
    yawning: true,
    "nose-picking": false,
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const toggleHabit = (habitId: string) => {
    setEnabledHabits((prev) => ({
      ...prev,
      [habitId]: !prev[habitId],
    }))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-white">Habits</h2>

      <Card
        className="p-8 backdrop-blur-xl bg-gradient-to-br from-indigo-950/40 via-indigo-900/30 to-blue-900/30 border border-white/20 shadow-2xl shadow-indigo-500/20 rounded-2xl overflow-hidden relative"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isHovering && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
            style={{
              opacity: isHovering ? 1 : 0,
              background: `radial-gradient(ellipse 400px 240px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.15), rgba(199, 210, 254, 0.2) 20%, rgba(99, 102, 241, 0.25) 40%, rgba(67, 56, 202, 0.15) 60%, rgba(55, 48, 163, 0.08) 80%, transparent 100%)`,
            }}
          />
        )}

        <div className="space-y-1 relative z-10">
          {HABITS.map((habit, index) => {
            return (
              <div key={habit.id}>
                <div className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-blue-500/20 transition-all hover:shadow-lg hover:shadow-indigo-500/30 group">
                  <Label
                    htmlFor={habit.id}
                    className="text-base font-medium cursor-pointer text-white/90 group-hover:text-white transition-colors"
                  >
                    {habit.label}
                  </Label>

                  <Switch
                    id={habit.id}
                    checked={enabledHabits[habit.id]}
                    onCheckedChange={() => toggleHabit(habit.id)}
                  />
                </div>
                {index < HABITS.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent mx-4" />
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
