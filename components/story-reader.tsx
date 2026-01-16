'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Paragraph } from '@/lib/supabase'
import { AmbientParticles } from './ambient-particles'

interface StoryData {
  paragraphs: Paragraph[]
  driftLevel: number
  lastUpdate: string | null
}

export function StoryReader() {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([])
  const [driftLevel, setDriftLevel] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(120)
  const [copied, setCopied] = useState(false)

  const fetchStory = useCallback(async () => {
    try {
      const response = await fetch('/api/story')
      if (!response.ok) {
        throw new Error('Failed to fetch story')
      }
      const data: StoryData = await response.json()
      setParagraphs(data.paragraphs)
      setDriftLevel(data.driftLevel)
      setLastUpdate(data.lastUpdate)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch story on mount and poll every 30 seconds
  useEffect(() => {
    fetchStory()
    const interval = setInterval(fetchStory, 30000)
    return () => clearInterval(interval)
  }, [fetchStory])

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      if (!lastUpdate) {
        // No last update, show full countdown
        setCountdown(120)
        return
      }

      const lastUpdateTime = new Date(lastUpdate).getTime()
      const now = Date.now()
      const elapsed = (now - lastUpdateTime) / 1000
      
      // Calculate remaining time in current 2-minute cycle
      // If more than 2 mins have passed, calculate time into next cycle
      const cycleTime = 120 // 2 minutes
      const timeIntoCycle = elapsed % cycleTime
      const remaining = cycleTime - timeIntoCycle
      
      setCountdown(Math.floor(remaining))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [lastUpdate])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that don't support clipboard API
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDriftLabel = (drift: number) => {
    if (drift < 0.2) return 'Lucid'
    if (drift < 0.4) return 'Hazy'
    if (drift < 0.6) return 'Surreal'
    if (drift < 0.8) return 'Fractured'
    return 'Dissolved'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground font-serif italic">Loading the dream...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-destructive font-sans text-sm">Error: {error}</div>
      </div>
    )
  }

  return (
    <>
      {/* Ambient particles */}
      <AmbientParticles driftLevel={driftLevel} />

      {/* Stats bar */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-sans text-muted-foreground">
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live</span>
        </div>

        {/* Paragraph counter */}
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{paragraphs.length} paragraphs</span>
        </div>

        {/* Next update countdown */}
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Next in {formatCountdown(countdown)}</span>
        </div>

        {/* Drift meter */}
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(5, driftLevel * 100)}%` }}
              />
            </div>
            <span className="text-[10px] opacity-70">{getDriftLabel(driftLevel)}</span>
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-foreground/10 hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Story content */}
      {paragraphs.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground font-serif italic">The story has not begun yet...</div>
        </div>
      ) : (
        <div className="space-y-8 relative z-10">
          {paragraphs.map((paragraph, index) => (
            <p
              key={paragraph.id}
              className="story-paragraph"
              style={{
                animation: `fadeIn 0.5s ease-in ${index * 0.1}s both`
              }}
            >
              {paragraph.content}
            </p>
          ))}
          
          {/* New paragraph indicator */}
          {countdown < 10 && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-muted-foreground/50 text-sm font-serif italic">
                <span className="inline-block w-1 h-1 rounded-full bg-current animate-pulse" />
                <span>A new fragment is forming...</span>
                <span className="inline-block w-1 h-1 rounded-full bg-current animate-pulse" />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
