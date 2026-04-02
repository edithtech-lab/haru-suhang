'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { BAE_TARGET } from '@/lib/constants'

interface Counter108Props {
  count: number
  onCount: () => void
  completed: boolean
}

export function Counter108({ count, onCount, completed }: Counter108Props) {
  const [pressing, setPressing] = useState(false)
  const progress = count / BAE_TARGET
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const handleInteraction = useCallback(() => {
    if (!completed) {
      setPressing(true)
      onCount()
      setTimeout(() => setPressing(false), 100)
    }
  }, [completed, onCount])

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={cn(
          'relative cursor-pointer select-none',
          completed && 'celebrate'
        )}
        onClick={handleInteraction}
        onTouchStart={(e) => { e.preventDefault(); handleInteraction() }}
      >
        <svg width="280" height="280" viewBox="0 0 280 280">
          {/* 배경 원 */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="rgba(212,165,116,0.15)"
            strokeWidth="8"
          />
          {/* 프로그레스 원 */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={completed ? '#8fbc8f' : '#d4a574'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 140 140)"
            className="transition-all duration-300"
          />
        </svg>

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'text-6xl font-bold transition-transform duration-100',
              pressing && 'scale-95',
              completed ? 'text-success' : 'text-accent'
            )}
          >
            {count}
          </span>
          <span className="text-muted text-sm mt-1">/ {BAE_TARGET}</span>
          {completed && (
            <span className="text-success text-sm mt-2 font-medium">
              수행 완료
            </span>
          )}
        </div>
      </div>

      {!completed && (
        <p className="text-muted text-sm">화면을 터치하여 절을 세세요</p>
      )}
    </div>
  )
}
