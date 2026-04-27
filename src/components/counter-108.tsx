'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { BAE_TARGET } from '@/lib/constants'
import { Mandala } from '@/components/mandala'

interface Counter108Props {
  count: number
  onCount: () => void
  completed: boolean
}

export function Counter108({ count, onCount, completed }: Counter108Props) {
  const [pressing, setPressing] = useState(false)
  const progress = count / BAE_TARGET

  const handleInteraction = useCallback(() => {
    if (!completed) {
      setPressing(true)
      onCount()
      setTimeout(() => setPressing(false), 120)
    }
  }, [completed, onCount])

  return (
    <div
      className="relative w-full min-h-[60vh] flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={handleInteraction}
      onTouchStart={(e) => { e.preventDefault(); handleInteraction() }}
    >
      {/* 큰 만다라 배경 (회전·호흡) */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700',
          pressing && 'scale-[1.02]',
          completed && 'opacity-60',
        )}
      >
        <Mandala
          size={280}
          className={cn(
            'transition-colors duration-500',
            completed ? 'text-success/60' : 'text-foreground/25',
          )}
          inner
        />
      </div>

      {/* 미세 회전 만다라 (외곽) */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transform: `rotate(${progress * 360}deg)`,
          transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Mandala size={340} className="text-accent/15" />
      </div>

      {/* 카운트 텍스트 */}
      <div className="relative z-10 text-center">
        <p className="label-upper mb-3 text-foreground-dim">
          108 Bows
        </p>
        <p
          className={cn(
            'text-foreground text-[120px] tracking-tight leading-none tabular-nums font-light transition-transform duration-100',
            pressing && 'scale-[0.96]',
            completed && 'text-success',
          )}
          style={{ fontVariationSettings: '"wght" 280' }}
        >
          {count}
        </p>
        <p className="label-tag mt-3 tabular-nums">
          / {BAE_TARGET}
        </p>
        {completed && (
          <p className="text-success text-[12px] uppercase tracking-[0.3em] mt-5 animate-in">
            Complete
          </p>
        )}
      </div>

      {/* 하단 안내 */}
      {!completed && (
        <p className="absolute bottom-0 label-upper text-foreground-dim animate-in stagger-2">
          Tap anywhere to count
        </p>
      )}
    </div>
  )
}
