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
      <div className="overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-indigo-950/50 via-indigo-900/40 to-blue-900/50 border border-white/20 shadow-xl shadow-indigo-500/20 transition-all duration-500 hover:shadow-indigo-500/30 hover:scale-[1.01]">
        <div className="relative w-[360px] h-[270px] bg-gradient-to-br from-indigo-950/30 to-blue-950/30 overflow-hidden">
          {/* Soft animated border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 via-purple-400/10 to-blue-400/10 animate-soft-shimmer"></div>
          {isActive ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover relative z-10" />

              {/* Recording indicator - softer */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-gradient-to-r from-green-500/80 to-emerald-600/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold shadow-md shadow-green-500/30 border border-white/20">
                <div className="w-2.5 h-2.5 bg-white/90 rounded-full animate-pulse shadow-sm shadow-white/30" />
                LIVE MONITORING
              </div>

              {/* Corner accent - very subtle */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-400/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-400/20 to-transparent"></div>
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

        {/* Stats panel - softer colors */}
        <div className="bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-blue-900/50 backdrop-blur-md px-6 py-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400/70 rounded-full animate-soft-shimmer"></div>
              <span className="text-sm text-white/75 font-semibold">Distractions Today</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent">{distractionCount}</span>
            </div>
          </div>

          {/* Progress bar - softer gradient */}
          <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400/80 via-purple-400/80 to-pink-400/80 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min((distractionCount / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
