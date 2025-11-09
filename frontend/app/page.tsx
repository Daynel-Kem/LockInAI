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
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/20 text-white placeholder-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
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
