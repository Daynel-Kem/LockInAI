"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Globe } from "lucide-react"

const INITIAL_WEBSITES = ["youtube.com", "twitter.com", "instagram.com", "tiktok.com"]

export function RestrictedWebsites() {
  const [websites, setWebsites] = useState<string[]>(INITIAL_WEBSITES)
  const [inputValue, setInputValue] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const animationFrameRef = useRef<number>()

  const addWebsite = () => {
    if (inputValue.trim()) {
      setWebsites([...websites, inputValue.trim()])
      setInputValue("")
      setIsAdding(false)
    }
  }

  const removeWebsite = (index: number) => {
    setWebsites(websites.filter((_, i) => i !== index))
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
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-white">Restricted Websites</h2>

      <Card
        className="p-8 backdrop-blur-xl bg-gradient-to-br from-indigo-950/40 via-indigo-900/30 to-blue-900/30 border border-white/20 shadow-2xl shadow-indigo-500/20 rounded-2xl overflow-hidden relative"
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

        <div className="space-y-3 relative z-10">
          <div className="space-y-3">
            {websites.map((website, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl hover:from-indigo-500/20 hover:to-blue-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all group border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/30 to-blue-500/30 flex items-center justify-center border border-white/20 group-hover:from-indigo-500/40 group-hover:to-blue-500/40 transition-all">
                    <Globe className="w-5 h-5 text-indigo-300" />
                  </div>
                  <span className="text-white/90 font-medium text-base group-hover:text-white transition-colors">
                    {website}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWebsite(index)}
                  className="h-9 w-9 text-white/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>

          {isAdding ? (
            <div className="flex gap-2 pt-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addWebsite()
                  if (e.key === "Escape") setIsAdding(false)
                }}
                autoFocus
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
              <Button
                onClick={addWebsite}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
              >
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setInputValue("")
                }}
                className="border-white/10 text-white/70 hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="w-full gap-2 mt-3 border-white/20 text-white/80 hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-blue-500/20 hover:text-white backdrop-blur-sm h-12 hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Website
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
