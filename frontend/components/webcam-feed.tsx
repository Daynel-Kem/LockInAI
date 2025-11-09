"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CameraOff } from "lucide-react"

export function WebcamFeed() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [distractionCount, setDistractionCount] = useState(0)

  useEffect(() => {
    let stream: MediaStream | null = null

    async function startWebcam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 360, height: 270 },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsActive(true)
        }
      } catch (err) {
        setError("Unable to access webcam")
        console.error("Webcam error:", err)
      }
    }

    startWebcam()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setDistractionCount((prev) => prev + 1)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed top-8 right-8 z-50 animate-fade-in">
      <div className="overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-indigo-950/60 via-indigo-900/50 to-blue-900/60 border-2 border-white/30 shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50 hover:scale-[1.02]">
        <div className="relative w-[360px] h-[270px] bg-gradient-to-br from-indigo-950/40 to-blue-950/40 overflow-hidden">
          {/* Animated border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-20 animate-pulse"></div>
          {isActive ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover relative z-10" />

              {/* Recording indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-green-500/50 border border-white/30">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-lg shadow-white/50" />
                LIVE MONITORING
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-500/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/30 to-transparent"></div>
            </>
          ) : error ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
              <CameraOff className="w-12 h-12 mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
              <Camera className="w-12 h-12 mb-2" />
              <p className="text-sm">Starting camera...</p>
            </div>
          )}
        </div>

        {/* Stats panel */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-blue-900/60 backdrop-blur-md px-6 py-4 border-t-2 border-white/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-white/80 font-semibold">Distractions Today</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">{distractionCount}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((distractionCount / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
