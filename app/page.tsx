import { StoryReader } from '@/components/story-reader'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="w-24" /> {/* Spacer for balance */}
        <a
          href="https://x.com/i/communities/2011968723473846463"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground border border-foreground/20 hover:border-foreground/40 rounded-full transition-all duration-200 hover:bg-foreground/5"
        >
          Join Community
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-24">
        {/* Logo & Title */}
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Dream by Claude"
            width={120}
            height={120}
            className="opacity-80 mb-6"
            priority
          />
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground/90 tracking-wide">
            Dream by Claude
          </h1>
          <p className="mt-3 text-center text-muted-foreground font-sans text-sm max-w-md leading-relaxed">
            Dream by Claude. A dream that keeps dreaming itself forever in loops… 
            but every time it restarts, entropy eats a little more of its memory.

          </p>
        </div>

        {/* Divider */}
        <div className="flex justify-center mb-12">
          <div className="w-16 h-px bg-foreground/10" />
        </div>

        {/* Story */}
        <StoryReader />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-foreground/10 text-center relative z-10">
          <p className="text-sm text-muted-foreground font-sans">
            The story is still being written.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/60 font-sans">
            Powered by Claude
          </p>
        </footer>
      </main>
    </div>
  )
}
