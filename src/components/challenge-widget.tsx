'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getActiveChallengeForWidget } from '@/lib/challenge-store'
import type { ChallengeWithProgress } from '@/types'

export function ChallengeWidget({ userId }: { userId: string | null }) {
  const [challenge, setChallenge] = useState<ChallengeWithProgress | null>(null)

  useEffect(() => {
    if (userId) {
      getActiveChallengeForWidget(userId).then(setChallenge)
    }
  }, [userId])

  if (!userId || !challenge) return null

  const progressPct = challenge.target_days > 0
    ? Math.min(100, Math.round((challenge.progress_days / challenge.target_days) * 100))
    : 0

  return (
    <Link href="/doban">
      <Card hover className="flex items-center gap-3">
        <span className="text-2xl">{challenge.badge_emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-accent shrink-0" />
            <span className="text-sm font-bold text-foreground truncate">{challenge.title}</span>
          </div>
          <div className="mt-1.5 w-full h-1.5 bg-card-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[11px] text-muted mt-1">{challenge.progress_days}/{challenge.target_days}일 완료</p>
        </div>
      </Card>
    </Link>
  )
}
