'use client'

import { useState, useCallback } from 'react'
import { Counter108 } from '@/components/counter-108'
import { getSoundGenerator } from '@/components/audio-player'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { savePractice } from '@/lib/practice-store'
import { BAE_TARGET } from '@/lib/constants'
import { RotateCcw } from 'lucide-react'

export default function Bae108Page() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [startTime] = useState(Date.now())

  const handleCount = useCallback(() => {
    if (completed) return

    const newCount = count + 1
    setCount(newCount)
    getSoundGenerator().playMoktak()

    if (newCount >= BAE_TARGET) {
      setCompleted(true)
      // 종소리는 약간 딜레이
      setTimeout(() => {
        getSoundGenerator().playBell(1)
      }, 300)

      // 자동 저장
      const durationSec = Math.floor((Date.now() - startTime) / 1000)
      savePractice(user?.id ?? null, 'bae108', durationSec, BAE_TARGET, true)
        .then(() => setSaved(true))
    }
  }, [count, completed, startTime, user])

  const handleReset = () => {
    setCount(0)
    setCompleted(false)
    setSaved(false)
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">108배</h1>
        <p className="text-sm text-muted mt-1">한 절 한 절, 마음을 내려놓으세요</p>
      </div>

      <div className="flex justify-center py-4">
        <Counter108
          count={count}
          onCount={handleCount}
          completed={completed}
        />
      </div>

      {completed && (
        <Card className="text-center space-y-3">
          <p className="text-lg font-bold text-success">108배를 모두 마쳤습니다</p>
          <p className="text-sm text-muted">
            {saved ? '수행 기록이 저장되었습니다' : '기록 저장 중...'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw size={16} />
            다시 시작
          </Button>
        </Card>
      )}

      {!completed && count > 0 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw size={14} />
            초기화
          </Button>
        </div>
      )}
    </div>
  )
}
