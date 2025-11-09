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
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        </div>

        {/* Event Type Filter */}
        <select
          value={selectedEventType}
          onChange={(e) => setSelectedEventType(e.target.value)}
          className="px-5 py-2.5 backdrop-blur-xl bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10 hover:border-white/30 cursor-pointer"
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
        className="p-8 backdrop-blur-xl bg-gradient-to-br from-purple-950/35 via-purple-900/25 to-pink-900/30 border border-white/15 shadow-xl shadow-purple-500/15 rounded-2xl overflow-hidden relative transition-all duration-500 hover:shadow-purple-500/20 hover:border-white/25"
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
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-white/60 text-base">No detections yet</p>
              <p className="text-white/40 text-sm mt-2">Start monitoring to see the leaderboard!</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div key={entry.username}>
                <div className="flex items-center justify-between py-4 px-5 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-lg transition-transform group-hover:scale-110 ${
                      index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 shadow-yellow-500/50" :
                      index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-gray-400/50" :
                      index === 2 ? "bg-gradient-to-br from-orange-500 to-orange-700 text-orange-100 shadow-orange-500/50" :
                      "bg-white/10 text-white/60 shadow-white/10"
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
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                        {entry.detection_count}
                      </div>
                    </div>
                    <div className="text-xs text-white/50 font-medium">
                      {entry.detection_count === 1 ? 'catch' : 'catches'}
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
      <div className="flex items-center gap-3 mt-8">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
      </div>
      <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-blue-950/35 via-cyan-950/25 to-indigo-950/35 border border-white/15 shadow-xl shadow-blue-500/12 rounded-2xl transition-all duration-500 hover:shadow-blue-500/18 hover:border-white/25">
        <div className="space-y-2">
          {recentDetections.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-white/60 text-sm">No recent activity</p>
            </div>
          ) : (
            recentDetections.map((detection, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 border border-white/10 hover:border-white/20 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{detection.username[0].toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white/90 group-hover:text-white transition-colors">
                      {detection.username}
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/70 text-sm">
                      {detection.event_type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-semibold">
                    {Math.round(detection.confidence * 100)}%
                  </div>
                  <span className="text-xs text-white/50 font-medium">
                    {formatTimestamp(detection.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
