"use client"
import { WebcamFeed } from "@/components/webcam-feed"
import { HabitToggles } from "@/components/habit-toggles"
import { RestrictedWebsites } from "@/components/restricted-websites"
import { Leaderboard } from "@/components/leaderboard"
import { useState } from "react"

export default function Home() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [username, setUsername] = useState("")
  const [enabledHabits, setEnabledHabits] = useState({
    "nail-biting": true,
    yawning: true,
    "nose-picking": false,
  });

  const [websites, setWebsites] = useState([
    "youtube", "twitter", "instagram", "tiktok"
  ]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1429] relative overflow-hidden">
      {/* Animated background elements - softer and more eye-friendly */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[140px] animate-breathe"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[140px] animate-breathe animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[140px] animate-breathe animation-delay-4000"></div>

        {/* Subtle overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0e27]/30"></div>
      </div>

      {/* Fixed Webcam in top right */}
      <WebcamFeed />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12 pr-[340px] relative z-10">
        <div className="flex items-center justify-between mb-12 animate-fade-in">
          <div className="flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400/80 via-purple-400/80 to-blue-500/80 flex items-center justify-center shadow-xl shadow-indigo-500/30 transition-all duration-500 group-hover:shadow-indigo-500/40 group-hover:scale-[1.03] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <svg className="w-8 h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">LockIn AI</h1>
              <p className="text-sm text-white/50 font-medium">Stay focused. Stay productive.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-5 py-3 backdrop-blur-xl bg-white/5 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all hover:border-white/30"
            />

            <button
              onClick={async() => {
                if (!username.trim()) {
                  alert("Please enter a username first!");
                  return;
                }

                const newState = !isMonitoring
                setIsMonitoring(newState)
                const activeHabits = Object.entries(enabledHabits)
                  .filter(([_, value]) => value)
                  .map(([key]) => key);

                console.log("Active habits:", activeHabits);
                console.log("Restricted sites:", websites);
                console.log("Username:", username);
                try {
                  if (newState) {
                    console.log(websites);
                    console.log(activeHabits);
                    await fetch("http://localhost:5050/start", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        banned: websites,
                        config: activeHabits,
                        username: username.trim(),
                      }),
                    });
                  } else {
                    await fetch("http://localhost:5050/stop", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    });
                  }
                } catch (error) {
                  console.error("Error:", error);
                }
              }}
              className={`px-8 py-3 backdrop-blur-xl border border-white/20 text-white font-bold rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-[1.02] ${
                isMonitoring
                  ? "bg-gradient-to-br from-red-500/25 via-red-600/18 to-rose-600/25 hover:from-red-500/35 hover:via-red-600/28 hover:to-rose-600/35 shadow-red-500/20 hover:shadow-red-500/30"
                  : "bg-gradient-to-br from-green-500/25 via-green-600/18 to-emerald-600/25 hover:from-green-500/35 hover:via-green-600/28 hover:to-emerald-600/35 shadow-green-500/20 hover:shadow-green-500/30"
              }`}
            >
              <span className="flex items-center gap-2">
                {isMonitoring ? (
                  <>
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Start Monitoring
                  </>
                )}
              </span>
            </button>

            <button className="px-6 py-3 backdrop-blur-xl bg-gradient-to-br from-indigo-500/18 via-indigo-600/10 to-blue-600/18 border border-white/20 hover:from-indigo-500/28 hover:via-indigo-600/20 hover:to-blue-600/28 text-white font-bold rounded-xl transition-all duration-500 shadow-lg shadow-indigo-500/15 hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-[1.02]">
              Connect to Social Media
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Habits Section */}
          <HabitToggles enabledHabits={enabledHabits} setEnabledHabits={setEnabledHabits} />

          {/* Restricted Websites Section */}
          <RestrictedWebsites websites={websites} setWebsites={setWebsites} />

          {/* Leaderboard Section */}
          <Leaderboard />
        </div>
      </main>
    </div>
  )
}
