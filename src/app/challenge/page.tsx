'use client'

import { useEffect, useState } from 'react'
import { Trophy, Users, Calendar, LogIn } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getChallenges, joinChallenge, leaveChallenge } from '@/lib/challenge-store'
import type { ChallengeWithProgress } from '@/types'

export default function ChallengePage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [fetching, setFetching] = useState(true)

  const fetchChallenges = async () => {
    setFetching(true)
    const data = await getChallenges(user?.id ?? null)
    setChallenges(data)
    setFetching(false)
  }

  useEffect(() => {
    if (!loading) fetchChallenges()
  }, [user, loading])

  const handleJoin = async (challengeId: string) => {
    if (!user) return
    setLoadingId(challengeId)
    try {
      await joinChallenge(user.id, challengeId)
      await fetchChallenges()
    } catch (e) {
      alert(e instanceof Error ? e.message : '참여 실패')
    }
    setLoadingId(null)
  }

  const handleLeave = async (challengeId: string) => {
    if (!user || !confirm('챌린지를 탈퇴하시겠습니까?')) return
    setLoadingId(challengeId)
    try {
      await leaveChallenge(user.id, challengeId)
      await fetchChallenges()
    } catch (e) {
      alert(e instanceof Error ? e.message : '탈퇴 실패')
    }
    setLoadingId(null)
  }

  const today = new Date()

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <Trophy size={22} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">수행 챌린지</h1>
          <p className="text-sm text-muted">함께 정진하는 수행의 길</p>
        </div>
      </div>

      {!loading && !user && (
        <Card className="text-center space-y-3">
          <p className="text-muted text-sm">챌린지에 참여하려면 로그인이 필요합니다</p>
          <Button size="sm" onClick={signInWithGoogle}>
            <LogIn size={16} />
            로그인
          </Button>
        </Card>
      )}

      {fetching ? (
        <div className="text-center text-muted py-12">불러오는 중...</div>
      ) : challenges.length === 0 ? (
        <Card className="text-center">
          <p className="text-muted">현재 진행 중인 챌린지가 없습니다</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {challenges.map(ch => {
            const started = new Date(ch.start_date) <= today
            const daysLeft = Math.ceil((new Date(ch.end_date).getTime() - today.getTime()) / 86400000)
            const progressPct = ch.target_days > 0 ? Math.min(100, Math.round((ch.progress_days / ch.target_days) * 100)) : 0

            return (
              <Card key={ch.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ch.badge_emoji}</span>
                    <div>
                      <h3 className="font-bold text-foreground">{ch.title}</h3>
                      <p className="text-sm text-muted mt-0.5">{ch.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {ch.start_date} ~ {ch.end_date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} />
                    {ch.participant_count}명 참여
                  </span>
                  <span className="ml-auto font-medium text-accent">
                    {started ? `D-${daysLeft}` : `시작까지 D-${Math.ceil((new Date(ch.start_date).getTime() - today.getTime()) / 86400000)}`}
                  </span>
                </div>

                {ch.joined && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">진행도</span>
                      <span className="text-accent font-medium">{ch.progress_days} / {ch.target_days}일 ({progressPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-card-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {user && (
                  <div className="pt-1">
                    {ch.joined ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        loading={loadingId === ch.id}
                        onClick={() => handleLeave(ch.id)}
                      >
                        참여 중 · 탈퇴하기
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        loading={loadingId === ch.id}
                        onClick={() => handleJoin(ch.id)}
                      >
                        참여하기
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
