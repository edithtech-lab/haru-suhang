'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Plus, LogIn, ArrowRight, Trophy, Calendar as CalendarIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getMyGroups, createGroup, joinGroupByCode } from '@/lib/group-store'
import { getChallenges } from '@/lib/challenge-store'
import type { GroupWithStats, ChallengeWithProgress } from '@/types'

export default function DobanPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [groups, setGroups] = useState<GroupWithStats[]>([])
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [fetching, setFetching] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setFetching(true)
    if (user) {
      const [groupData, challengeData] = await Promise.all([
        getMyGroups(user.id),
        getChallenges(user.id),
      ])
      setGroups(groupData)
      setChallenges(challengeData)
    } else {
      const challengeData = await getChallenges(null)
      setChallenges(challengeData)
    }
    setFetching(false)
  }

  useEffect(() => {
    if (!loading) fetchData()
  }, [user, loading])

  const handleCreate = async () => {
    if (!user || !groupName.trim()) return
    setSubmitting(true)
    try {
      await createGroup(user.id, groupName.trim())
      setGroupName('')
      setShowCreate(false)
      await fetchData()
    } catch (e) {
      alert(e instanceof Error ? e.message : '그룹 생성 실패')
    }
    setSubmitting(false)
  }

  const handleJoin = async () => {
    if (!user || !inviteCode.trim()) return
    setSubmitting(true)
    try {
      await joinGroupByCode(user.id, inviteCode.trim())
      setInviteCode('')
      setShowJoin(false)
      await fetchData()
    } catch (e) {
      alert(e instanceof Error ? e.message : '참여 실패')
    }
    setSubmitting(false)
  }

  const today = new Date()
  const joinedChallenges = challenges.filter(ch => ch.joined)
  const availableChallenges = challenges.filter(ch => !ch.joined)

  return (
    <div className="px-5 py-8 space-y-8">
      <div className="flex items-center gap-4 animate-in">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Users size={24} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-text">도반</h1>
          <p className="text-sm text-muted">함께 수행하는 벗</p>
        </div>
      </div>

      {/* 비로그인 */}
      {!loading && !user && (
        <Card variant="glass" className="text-center space-y-3 animate-in stagger-1">
          <p className="text-muted text-sm">도반 그룹과 챌린지에 참여하려면 로그인이 필요합니다</p>
          <Button variant="gradient" size="sm" onClick={signInWithGoogle}>
            <LogIn size={16} />
            로그인
          </Button>
        </Card>
      )}

      {/* 챌린지 */}
      {!fetching && challenges.length > 0 && (
        <div className="space-y-3 animate-in stagger-1">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest px-1 flex items-center gap-1.5">
            <Trophy size={13} />
            수행 챌린지
          </h2>

          {joinedChallenges.map(ch => {
            const daysLeft = Math.ceil((new Date(ch.end_date).getTime() - today.getTime()) / 86400000)
            const progressPct = ch.target_days > 0 ? Math.min(100, Math.round((ch.progress_days / ch.target_days) * 100)) : 0

            return (
              <Card key={ch.id} variant="glass" className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{ch.badge_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{ch.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-muted/60 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <CalendarIcon size={11} />
                        D-{daysLeft}
                      </span>
                      <span>{ch.participant_count}명</span>
                    </div>
                  </div>
                  <span className="text-xs gradient-text font-bold">{progressPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-card-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      background: 'linear-gradient(90deg, #c9a87c, #e8d5b7)',
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted/50">{ch.progress_days} / {ch.target_days}일 완료</p>
              </Card>
            )
          })}

          {user && availableChallenges.length > 0 && (
            <div className="space-y-2">
              {availableChallenges.map(ch => (
                <Card key={ch.id} variant="glass" className="flex items-center gap-3">
                  <span className="text-xl">{ch.badge_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{ch.title}</h3>
                    <p className="text-[11px] text-muted/50">{ch.description}</p>
                  </div>
                  <span className="text-xs text-muted/40">{ch.participant_count}명</span>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 도반 그룹 */}
      {user && (
        <div className="space-y-4 animate-in stagger-2">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => { setShowCreate(!showCreate); setShowJoin(false) }}
            >
              <Plus size={16} />
              그룹 만들기
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => { setShowJoin(!showJoin); setShowCreate(false) }}
            >
              <ArrowRight size={16} />
              코드로 참여
            </Button>
          </div>

          {showCreate && (
            <Card variant="glass" className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">새 도반 그룹</h3>
              <input
                type="text"
                placeholder="그룹 이름 (예: 새벽 수행 모임)"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-3 glass rounded-xl text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30"
              />
              <Button variant="gradient" size="sm" className="w-full" loading={submitting} onClick={handleCreate} disabled={!groupName.trim()}>
                만들기
              </Button>
            </Card>
          )}

          {showJoin && (
            <Card variant="glass" className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">초대코드 입력</h3>
              <input
                type="text"
                placeholder="6자리 초대코드"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-3 glass rounded-xl text-sm text-foreground text-center tracking-[0.3em] font-mono placeholder:text-muted/40 placeholder:tracking-normal focus:outline-none focus:border-accent/30"
              />
              <Button variant="gradient" size="sm" className="w-full" loading={submitting} onClick={handleJoin} disabled={inviteCode.length < 6}>
                참여하기
              </Button>
            </Card>
          )}

          {fetching ? (
            <div className="text-center text-muted/40 py-8">불러오는 중...</div>
          ) : groups.length === 0 ? (
            <Card variant="glass" className="text-center py-10">
              <p className="text-3xl mb-3">🙏</p>
              <p className="text-muted text-sm">아직 참여 중인 그룹이 없습니다</p>
              <p className="text-muted/50 text-xs mt-1">그룹을 만들거나 초대코드로 참여하세요</p>
            </Card>
          ) : (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest px-1">내 도반 그룹</h2>
              {groups.map(g => (
                <Link key={g.id} href={`/doban/${g.id}`}>
                  <Card hover variant="glass" className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{g.name}</h3>
                      <p className="text-xs text-muted/50 mt-0.5">
                        <Users size={12} className="inline mr-1" />
                        {g.member_count}명
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-muted/30" />
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
