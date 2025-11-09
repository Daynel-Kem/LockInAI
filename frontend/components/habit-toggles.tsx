"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const HABITS = [
  { id: "nail-biting", label: "Nail Biting" },
  { id: "yawning", label: "Yawning" },
  { id: "nose-picking", label: "Nose Picking" },
]

export function HabitToggles({ enabledHabits,setEnabledHabits }) {

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const animationFrameRef = useRef<number>()

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

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }))
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    if (isHovering) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mousePosition, isHovering])

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white">Monitored Habits</h2>
      </div>

      <Card
        className="p-8 backdrop-blur-xl bg-gradient-to-br from-indigo-950/35 via-indigo-900/25 to-blue-900/30 border border-white/15 shadow-xl shadow-indigo-500/15 rounded-2xl overflow-hidden relative transition-all duration-500 hover:shadow-indigo-500/20 hover:border-white/25"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isHovering && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 400px 240px at ${smoothPosition.x}px ${smoothPosition.y}px, rgba(255, 255, 255, 0.15), rgba(199, 210, 254, 0.2) 20%, rgba(99, 102, 241, 0.25) 40%, rgba(67, 56, 202, 0.15) 60%, rgba(55, 48, 163, 0.08) 80%, transparent 100%)`,
              transition: "opacity 0.3s ease-in-out",
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
