'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, LogIn, ArrowRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getMyGroups, createGroup, joinGroupByCode } from '@/lib/group-store'
import { getChallenges } from '@/lib/challenge-store'
import { MoodBackdrop } from '@/components/mood-backdrop'
import { Mandala } from '@/components/mandala'
import { cn } from '@/lib/utils'
import type { GroupWithStats, ChallengeWithProgress } from '@/types'

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const ORB_GRADIENTS = [
  'var(--orb-warm)',
  'var(--orb-peaceful)',
  'var(--orb-cream)',
  'var(--orb-energy)',
]

export default function DobanPage() {
  const { user, loading } = useAuth()
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
    <div className="px-5 pt-5 pb-8 space-y-8">
      <MoodBackdrop mood="amber" />

      {/* ===== 헤더 ===== */}
      <header className="animate-in flex items-baseline justify-between">
        <div>
          <p className="label-upper">Fellowship</p>
          <h1 className="text-foreground text-[28px] tracking-tight mt-1.5 font-medium">
            도반
          </h1>
        </div>
        <p className="label-tag">함께 수행하는 벗</p>
      </header>

      {/* ===== 비로그인 ===== */}
      {!loading && !user && (
        <div className="animate-in stagger-1 surface-paper rounded-2xl p-5 flex items-center justify-between gap-4">
          <p className="text-foreground-dim text-sm">로그인하면 도반 그룹과 챌린지에 참여할 수 있어요</p>
          <Link
            href="/auth"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-full text-[12px] tracking-wide active:scale-95 transition-transform"
          >
            <LogIn size={14} />
            로그인
          </Link>
        </div>
      )}

      {/* ===== 챌린지 (Open #9 차용) ===== */}
      {!fetching && challenges.length > 0 && (
        <section className="animate-in stagger-1 space-y-3">
          <p className="label-upper">Challenges</p>

          {/* 참여 중인 챌린지 — 큰 카드 */}
          {joinedChallenges.map(ch => {
            const daysLeft = Math.ceil((new Date(ch.end_date).getTime() - today.getTime()) / 86400000)
            const progressPct = ch.target_days > 0 ? Math.min(100, Math.round((ch.progress_days / ch.target_days) * 100)) : 0
            const startMonth = new Date(ch.start_date)
            const monthLabel = `${MONTH_LABELS[startMonth.getMonth()]} ${startMonth.getFullYear()}`

            return (
              <div
                key={ch.id}
                className="surface-paper rounded-3xl p-5 flex items-center gap-5"
              >
                {/* 좌측: 만다라 아이콘 박스 */}
                <div className="shrink-0 w-24 h-24 rounded-2xl bg-black border border-[var(--surface-border)] flex items-center justify-center">
                  <Mandala size={68} className="text-foreground" inner />
                </div>

                {/* 우측: 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="label-upper text-foreground-dim mb-1">
                    {monthLabel}
                  </p>
                  <h3 className="text-foreground text-[19px] tracking-tight font-medium leading-tight mb-2 truncate">
                    {ch.title}
                  </h3>

                  {/* 참가자 아바타 + 카운트 */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-1">
                      {ORB_GRADIENTS.slice(0, 3).map((bg, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full ring-2 ring-black"
                          style={{ background: bg }}
                        />
                      ))}
                    </div>
                    <span className="label-tag">
                      {ch.participant_count} present · D-{Math.max(0, daysLeft)}
                    </span>
                  </div>

                  {/* 얇은 진행 선 */}
                  <div className="w-full h-[1.5px] bg-[var(--surface-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="label-tag mt-1.5 tabular-nums">
                    {ch.progress_days}/{ch.target_days}
                  </p>
                </div>
              </div>
            )
          })}

          {/* 가능한 챌린지 — 컴팩트 리스트 */}
          {user && availableChallenges.length > 0 && (
            <div className="space-y-0">
              {availableChallenges.map(ch => (
                <div
                  key={ch.id}
                  className="flex items-center gap-3 py-3.5 border-b border-[var(--surface-border)]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center text-base shrink-0">
                    {ch.badge_emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground text-[14px] tracking-tight">{ch.title}</h3>
                    <p className="label-tag truncate">{ch.description}</p>
                  </div>
                  <span className="label-tag shrink-0">{ch.participant_count}명</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== 그룹 ===== */}
      {user && (
        <section className="animate-in stagger-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="label-upper">My Groups</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowCreate(!showCreate); setShowJoin(false) }}
                className="text-[12px] text-foreground-dim hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Plus size={12} />
                만들기
              </button>
              <span className="text-[12px] text-muted-deep">·</span>
              <button
                onClick={() => { setShowJoin(!showJoin); setShowCreate(false) }}
                className="text-[12px] text-foreground-dim hover:text-foreground transition-colors"
              >
                코드로 참여
              </button>
            </div>
          </div>

          {showCreate && (
            <div className="surface-paper rounded-2xl p-4 space-y-3">
              <p className="text-foreground text-[14px] tracking-tight">새 도반 그룹</p>
              <input
                type="text"
                placeholder="그룹 이름 (예: 새벽 수행 모임)"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted/40 bg-[var(--surface)] border border-[var(--surface-border)] focus:outline-none focus:border-[var(--accent-glow)] transition-colors"
              />
              <Button variant="primary" size="sm" className="w-full" loading={submitting} onClick={handleCreate} disabled={!groupName.trim()}>
                만들기
              </Button>
            </div>
          )}

          {showJoin && (
            <div className="surface-paper rounded-2xl p-4 space-y-3">
              <p className="text-foreground text-[14px] tracking-tight">초대 코드</p>
              <input
                type="text"
                placeholder="6자리 코드"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground text-center tracking-[0.3em] font-mono placeholder:text-muted/40 placeholder:tracking-normal bg-[var(--surface)] border border-[var(--surface-border)] focus:outline-none focus:border-[var(--accent-glow)] transition-colors"
              />
              <Button variant="primary" size="sm" className="w-full" loading={submitting} onClick={handleJoin} disabled={inviteCode.length < 6}>
                참여
              </Button>
            </div>
          )}

          {fetching ? (
            <p className="text-foreground-dim text-sm py-6 text-center">불러오는 중...</p>
          ) : groups.length === 0 ? (
            <div className="surface-subtle rounded-2xl py-10 px-5 text-center">
              <p className="text-foreground text-sm">아직 참여 중인 그룹이 없습니다</p>
              <p className="label-tag mt-2">그룹을 만들거나 코드로 참여해보세요</p>
            </div>
          ) : (
            <ul className="space-y-0">
              {groups.map(g => (
                <li key={g.id}>
                  <Link
                    href={`/doban/${g.id}`}
                    className={cn(
                      'flex items-center gap-3 py-4 border-b border-[var(--surface-border)]',
                      'hover:bg-[var(--surface)] -mx-2 px-2 rounded-lg transition-colors',
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-strong)] flex items-center justify-center shrink-0">
                      <Users size={14} className="text-foreground-dim" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-[14px] tracking-tight truncate">{g.name}</p>
                      <p className="label-tag mt-0.5">{g.member_count} members</p>
                    </div>
                    <ArrowRight size={14} className="text-muted-deep" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
