'use client'

import { useCallback } from 'react'
import { MeditationTimer } from '@/components/meditation-timer'
import { useAuth } from '@/lib/auth-context'
import { savePractice } from '@/lib/practice-store'

export default function MeditationPage() {
  const { user } = useAuth()

  const handleComplete = useCallback((durationSec: number) => {
    savePractice(user?.id ?? null, 'meditation', durationSec, 1, true)
  }, [user])

  return (
    <div className="px-5 py-8 space-y-6">
      <div className="text-center animate-in">
        <h1 className="text-2xl font-bold">
          <span className="gradient-text">명상</span>
        </h1>
        <p className="text-sm text-muted mt-1.5">고요히 앉아 호흡에 집중하세요</p>
      </div>

      <div className="flex justify-center py-4 animate-in stagger-1">
        <MeditationTimer onComplete={handleComplete} />
      </div>
    </div>
  )
}
