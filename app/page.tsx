import { StoryReader } from '@/components/story-reader'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="mb-12 flex justify-center">
          <Image
            src="/logo.png"
            alt="Dream by Claude"
            width={120}
            height={120}
            className="opacity-80"
            priority
          />
        </div>
        <StoryReader />
        <footer className="mt-16 text-center text-sm text-muted-foreground font-sans">
          The story is still being written.
        </footer>
      </main>
    </div>
  )
}
