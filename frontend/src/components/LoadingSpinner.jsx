import React from 'react'
import { Loader2 } from 'lucide-react'

export function SpinnerIcon({ className = 'w-4 h-4' }) {
  return <Loader2 className={`${className} animate-spin`} />
}

export function PulsingDot({ color = 'bg-cyan-400' }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  )
}

export function SkeletonLine({ width = 'w-full', height = 'h-3' }) {
  return (
    <div className={`${width} ${height} rounded-full bg-white/8 progress-shimmer`} />
  )
}

export function SkeletonBlock() {
  return (
    <div className="space-y-3 animate-fade-in">
      <SkeletonLine width="w-3/4" height="h-4" />
      <SkeletonLine width="w-full" height="h-3" />
      <SkeletonLine width="w-5/6" height="h-3" />
      <SkeletonLine width="w-full" height="h-3" />
      <SkeletonLine width="w-2/3" height="h-3" />
    </div>
  )
}

export function ProgressBar({ progress = 0, animated = true }) {
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${animated ? 'progress-shimmer' : 'bg-gradient-to-r from-cyan-500 to-violet-600'}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
