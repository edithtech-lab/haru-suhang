'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, Search, Check, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getTodayStatus, getPracticeStats } from '@/lib/practice-store'
import { DAILY_WISDOMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { DailyStatus, PracticeStats } from '@/types'

const PRACTICES = [
  { href: '/bae108', label: '108배', english: 'Bow', duration: '10 min', key: 'bae108' as const },
  { href: '/meditation', label: '명상', english: 'Meditate', duration: '15 min', key: 'meditation' as const },
  { href: '/yeomju', label: '염불', english: 'Chant', duration: '10 min', key: 'yeobul' as const },
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [status, setStatus] = useState<DailyStatus>({ bae108: false, meditation: false, yeobul: false })
  const [stats, setStats] = useState<PracticeStats>({ streak: 0, totalDays: 0, totalBae108: 0, totalMeditation: 0, totalYeobul: 0 })

  const todayWisdom = DAILY_WISDOMS[new Date().getDate() % DAILY_WISDOMS.length]
  const greeting = getGreeting()
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '수행자'

  useEffect(() => {
    if (!loading) {
      const userId = user?.id ?? null
      getTodayStatus(userId).then(setStatus)
      getPracticeStats(userId).then(setStats)
    }
  }, [user, loading])

  // 다음에 할 수행 (미완료 중 첫 번째)
  const nextPractice = PRACTICES.find((p) => !status[p.key])
  const allDone = !nextPractice
  const completedCount = [status.bae108, status.meditation, status.yeobul].filter(Boolean).length

  return (
    <div className="flex flex-col">
      {/* ===== 상단 헤더 ===== */}
      <header className="animate-in flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <p className="text-[13px] text-foreground-dim">
            {greeting},
            <br />
            <span className="text-foreground">{userName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="검색"
            className="p-2 text-foreground-dim hover:text-foreground transition-colors"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
          {!loading && (
            user ? (
              <button
                onClick={signOut}
                aria-label="로그아웃"
                className="p-2 text-foreground-dim hover:text-foreground transition-colors"
              >
                <LogOut size={16} strokeWidth={1.5} />
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-accent border border-[var(--accent-glow)] rounded-full hover:bg-[var(--accent-glow)] transition-colors uppercase tracking-[0.18em]"
              >
                <LogIn size={11} />
                Sign in
              </button>
            )
          )}
        </div>
      </header>

      {/* ===== 히어로 — Open 스타일 풀블리드 영역 ===== */}
      <section className="animate-in stagger-1 px-5 mb-8">
        <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#0a0a0a]">
          {/* 이미지 placeholder — 나중에 <Image />로 교체 */}
          <div className="absolute inset-0">
            {/* 다층 그라데이션으로 풍부한 배경 연출 */}
            <div
              className="absolute inset-0"
              style={{
                background: allDone
                  ? 'radial-gradient(ellipse at 30% 30%, rgba(143, 184, 141, 0.35) 0%, rgba(10, 10, 10, 0.95) 60%), linear-gradient(180deg, #0a0a0a 0%, #000 100%)'
                  : 'radial-gradient(ellipse at 30% 20%, rgba(232, 118, 58, 0.4) 0%, rgba(10, 10, 10, 0.95) 55%), linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
              }}
            />
            <div
              className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full orb-pulse"
              style={{
                background: allDone ? 'var(--orb-peaceful)' : 'var(--orb-warm)',
                opacity: 0.65,
                filter: 'blur(20px)',
              }}
            />
          </div>

          {/* 하단 오버레이 */}
          <div className="absolute inset-0 hero-overlay" />

          {/* 콘텐츠 오버레이 */}
          <div className="relative h-full flex flex-col justify-between p-6">
            {/* 상단 라벨 */}
            <div className="flex items-center justify-between">
              <p className="label-upper">Today</p>
              <p className="label-upper">
                {new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
              </p>
            </div>

            {/* 하단 타이틀 + CTA */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                {allDone ? (
                  <>
                    <p className="text-foreground-dim text-sm mb-2">오늘의 수행</p>
                    <h2 className="text-[32px] leading-[1.1] tracking-tight text-foreground font-medium">
                      모두 완료
                    </h2>
                    <p className="text-foreground-dim text-sm mt-3">
                      {stats.streak}일 연속 수행 중
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-foreground-dim text-sm mb-1">
                      {nextPractice!.duration}
                    </p>
                    <h2 className="text-[34px] leading-[1.05] tracking-tight text-foreground font-medium">
                      {nextPractice!.label}
                    </h2>
                    <p className="text-foreground-dim text-[13px] mt-3 leading-relaxed line-clamp-2 max-w-[80%]">
                      {todayWisdom.text.slice(0, 50)}
                      {todayWisdom.text.length > 50 && '…'}
                    </p>
                  </>
                )}
              </div>

              {!allDone && (
                <Link
                  href={nextPractice!.href}
                  aria-label={`${nextPractice!.label} 시작`}
                  className="group shrink-0 w-12 h-12 rounded-full border border-foreground/30 flex items-center justify-center hover:border-foreground hover:bg-foreground/5 transition-all active:scale-95"
                >
                  <Play size={15} strokeWidth={1.5} className="text-foreground translate-x-[1px]" fill="currentColor" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* See All 링크 */}
        <div className="mt-4 flex items-center justify-between">
          <p className="label-upper">
            {allDone ? (
              <span className="text-success">All done · {completedCount}/3</span>
            ) : (
              <span>Progress · {completedCount}/3</span>
            )}
          </p>
          <Link href="/calendar" className="text-[12px] text-foreground-dim hover:text-foreground transition-colors">
            See all →
          </Link>
        </div>
      </section>

      {/* ===== 오늘의 수행 스케줄 리스트 ===== */}
      <section className="animate-in stagger-2 px-5 mb-8">
        <h3 className="text-[28px] tracking-tight text-foreground mb-5 font-medium">
          Practice
        </h3>

        <ul className="space-y-0">
          {PRACTICES.map(({ href, label, english, duration, key }, idx) => {
            const done = status[key]
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-center gap-4 py-4 border-b border-[var(--surface-border)] hover:bg-[var(--surface)] -mx-2 px-2 rounded-lg transition-colors"
                >
                  {/* 인덱스 */}
                  <span className="label-tag w-5 tabular-nums">
                    0{idx + 1}
                  </span>

                  {/* 썸네일 오브 */}
                  <div
                    className={cn(
                      'shrink-0 w-11 h-11 rounded-full transition-opacity',
                      done ? 'opacity-40' : 'opacity-100',
                    )}
                    style={{
                      background: idx === 0 ? 'var(--orb-warm)' : idx === 1 ? 'var(--orb-peaceful)' : 'var(--orb-cream)',
                    }}
                  />

                  {/* 텍스트 */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-[15px] tracking-tight',
                      done ? 'text-foreground-dim line-through decoration-1' : 'text-foreground',
                    )}>
                      {label}
                    </p>
                    <p className="label-tag mt-0.5">
                      {english} · {duration}
                    </p>
                  </div>

                  {/* 상태 */}
                  <div className="shrink-0">
                    {done ? (
                      <div className="flex items-center gap-1.5">
                        <Check size={13} className="text-success" strokeWidth={2.5} />
                        <span className="label-tag text-success">Done</span>
                      </div>
                    ) : (
                      <span className="label-tag text-foreground-dim group-hover:text-accent transition-colors">
                        Start →
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ===== 오늘의 법어 — 심플 인라인 ===== */}
      <section className="animate-in stagger-3 px-5 mb-8">
        <p className="label-tag mb-3">Today's wisdom</p>
        <blockquote className="text-[15px] leading-[1.6] text-foreground-dim">
          {todayWisdom.text}
        </blockquote>
        <p className="mt-2 text-[11px] text-muted uppercase tracking-[0.2em]">
          — {todayWisdom.source}
        </p>
      </section>

      {/* ===== 바로가기 — 미니멀 텍스트 링크 ===== */}
      <section className="animate-in stagger-4 px-5">
        <p className="label-tag mb-3">Explore</p>
        <div className="flex items-center gap-6">
          <Link href="/sutra" className="text-[15px] text-foreground hover:text-accent transition-colors">
            경전 <span className="text-muted text-sm">→</span>
          </Link>
          <Link href="/wisdom" className="text-[15px] text-foreground hover:text-accent transition-colors">
            법문 <span className="text-muted text-sm">→</span>
          </Link>
          <Link href="/doban" className="text-[15px] text-foreground hover:text-accent transition-colors">
            도반 <span className="text-muted text-sm">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
