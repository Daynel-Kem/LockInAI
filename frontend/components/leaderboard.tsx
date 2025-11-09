"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface LeaderboardEntry {
  username: string
  detection_count: number
  avg_confidence: number
  last_detected: string
}

interface RecentDetection {
  username: string
  event_type: string
  confidence: number
  timestamp: string
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentDetections, setRecentDetections] = useState<RecentDetection[]>([])
  const [selectedEventType, setSelectedEventType] = useState<string>("all")
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const animationFrameRef = useRef<number>()

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const url = selectedEventType === "all"
        ? "http://localhost:5050/leaderboard?limit=10"
        : `http://localhost:5050/leaderboard?event_type=${selectedEventType}&limit=10`

      const response = await fetch(url)
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    }
  }

  // Fetch recent detections
  const fetchRecentDetections = async () => {
    try {
      const response = await fetch("http://localhost:5050/recent-detections?limit=5")
      const data = await response.json()
      setRecentDetections(data.detections || [])
    } catch (error) {
      console.error("Failed to fetch recent detections:", error)
    }
  }

  // Fetch event types
  const fetchEventTypes = async () => {
    try {
      const response = await fetch("http://localhost:5050/event-types")
      const data = await response.json()
      setEventTypes(data.event_types || [])
    } catch (error) {
      console.error("Failed to fetch event types:", error)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    fetchRecentDetections()
    fetchEventTypes()

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchLeaderboard()
      fetchRecentDetections()
    }, 10000)

    return () => clearInterval(interval)
  }, [selectedEventType])

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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>

        {/* Event Type Filter */}
        <select
          value={selectedEventType}
          onChange={(e) => setSelectedEventType(e.target.value)}
          className="px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        >
          <option value="all">All Events</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <Card
        className="p-8 backdrop-blur-xl bg-gradient-to-br from-purple-950/40 via-purple-900/30 to-pink-900/30 border border-white/20 shadow-2xl shadow-purple-500/20 rounded-2xl overflow-hidden relative"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isHovering && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 400px 240px at ${smoothPosition.x}px ${smoothPosition.y}px, rgba(255, 255, 255, 0.15), rgba(244, 114, 182, 0.2) 20%, rgba(168, 85, 247, 0.25) 40%, rgba(147, 51, 234, 0.15) 60%, rgba(126, 34, 206, 0.08) 80%, transparent 100%)`,
              transition: "opacity 0.3s ease-in-out",
            }}
          />
        )}

        <div className="space-y-1 relative z-10">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              No detections yet. Start monitoring to see the leaderboard!
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div key={entry.username}>
                <div className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/30 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? "bg-yellow-500 text-yellow-900" :
                      index === 1 ? "bg-gray-300 text-gray-700" :
                      index === 2 ? "bg-orange-600 text-orange-100" :
                      "bg-white/10 text-white/60"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-base font-medium text-white/90 group-hover:text-white transition-colors">
                        {entry.username}
                      </div>
                      <div className="text-xs text-white/50">
                        Last: {formatTimestamp(entry.last_detected)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {entry.detection_count}
                    </div>
                    <div className="text-xs text-white/50">
                      catches
                    </div>
                  </div>
                </div>
                {index < leaderboard.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent mx-4" />
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <h2 className="text-2xl font-bold text-white mt-8">Recent Activity</h2>
      <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-indigo-950/40 via-indigo-900/30 to-blue-900/30 border border-white/20 shadow-2xl shadow-indigo-500/20 rounded-2xl">
        <div className="space-y-3">
          {recentDetections.length === 0 ? (
            <div className="text-center py-4 text-white/60">
              No recent activity
            </div>
          ) : (
            recentDetections.map((detection, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white/90">
                    {detection.username}
                  </span>
                  <span className="text-white/50">→</span>
                  <span className="text-white/70">
                    {detection.event_type.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-white/50">
                  {formatTimestamp(detection.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
