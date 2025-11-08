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
    <div className="fixed top-8 right-8 z-50">
      <div className="overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-indigo-950/40 via-indigo-900/30 to-blue-900/30 border border-white/20 shadow-2xl shadow-indigo-500/20">
        <div className="relative w-[360px] h-[270px] bg-gradient-to-br from-indigo-950/40 to-blue-950/40">
          {isActive ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-green-500/40">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live
              </div>
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
        <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 backdrop-blur-sm px-5 py-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70 font-medium">Distractions Detected:</span>
            <span className="text-sm font-semibold text-white/90">{distractionCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
