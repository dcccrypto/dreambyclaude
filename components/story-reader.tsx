'use client'

import { useEffect, useState } from 'react'
import type { Paragraph } from '@/lib/supabase'

export function StoryReader() {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStory() {
      try {
        const response = await fetch('/api/story')
        if (!response.ok) {
          throw new Error('Failed to fetch story')
        }
        const data = await response.json()
        setParagraphs(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStory()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchStory, 30000)
    return () => clearInterval(interval)
  }, [])

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

  if (paragraphs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground font-serif italic">The story has not begun yet...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
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
    </div>
  )
}
