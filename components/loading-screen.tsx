'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [opacity, setOpacity] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Fade in
    const fadeInTimer = setTimeout(() => setOpacity(1), 100)
    // Hold then fade out
    const holdTimer = setTimeout(() => setFadeOut(true), 2200)
    const doneTimer = setTimeout(() => onDone(), 3000)
    return () => {
      clearTimeout(fadeInTimer)
      clearTimeout(holdTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary transition-opacity duration-700"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      <div
        className="flex flex-col items-center gap-6 transition-opacity duration-700"
        style={{ opacity }}
      >
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-primary-foreground/30 bg-primary-foreground/10">
          <Image
            src="/logo.jpg"
            alt="Serenidad logo"
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <h1 className="font-serif text-3xl font-semibold tracking-wide text-primary-foreground">
            Serenidad
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/70 tracking-widest uppercase">
            Servicios Funerarios
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-primary-foreground/60 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
