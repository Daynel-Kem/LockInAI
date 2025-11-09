"use client"
import { WebcamFeed } from "@/components/webcam-feed"
import { HabitToggles } from "@/components/habit-toggles"
import { RestrictedWebsites } from "@/components/restricted-websites"
import { useState } from "react"

export default function Home() {
  const [isMonitoring, setIsMonitoring] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1429]">
      {/* Fixed Webcam in top right */}
      <WebcamFeed />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12 pr-[340px]">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <h1 className="text-3xl font-bold text-white">LockIn AI</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-6 py-2.5 backdrop-blur-xl border border-white/20 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg ${
                isMonitoring
                  ? "bg-gradient-to-br from-red-950/40 via-red-900/30 to-rose-900/30 hover:from-red-950/60 hover:via-red-900/50 hover:to-rose-900/50 shadow-red-500/20 hover:shadow-red-500/30"
                  : "bg-gradient-to-br from-green-950/40 via-green-900/30 to-emerald-900/30 hover:from-green-950/60 hover:via-green-900/50 hover:to-emerald-900/50 shadow-green-500/20 hover:shadow-green-500/30"
              }`}
            >
              {isMonitoring ? "Stop" : "Start"}
            </button>

            <button className="px-6 py-2.5 backdrop-blur-xl bg-gradient-to-br from-indigo-950/40 via-indigo-900/30 to-blue-900/30 border border-white/20 hover:from-indigo-950/60 hover:via-indigo-900/50 hover:to-blue-900/50 text-white font-bold rounded-lg transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30">
              Connect to Social Media
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Habits Section */}
          <HabitToggles />

          {/* Restricted Websites Section */}
          <RestrictedWebsites />
        </div>
      </main>
    </div>
  )
}
