'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, Search, Check, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getTodayStatus, getPracticeStats } from '@/lib/practice-store'
import { DAILY_WISDOMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { MoodBackdrop } from '@/components/mood-backdrop'
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
  const { user, loading, signOut } = useAuth()
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
      <MoodBackdrop mood="warm-dusk" />
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
              <Link
                href="/auth"
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-accent border border-[var(--accent-glow)] rounded-full hover:bg-[var(--accent-glow)] transition-colors uppercase tracking-[0.18em]"
              >
                <LogIn size={11} />
                Sign in
              </Link>
            )
          )}
        </div>
      </header>

      {/* ===== 히어로 — Open 시네마틱 lighting ===== */}
      <section className="animate-in stagger-1 px-5 mb-8">
        <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-black">
          {/* 다층 시네마틱 lighting */}
          <div className="absolute inset-0">
            {/* 메인 다층 그라데이션 — 위쪽에서 빛 들어오고, 하단 깊은 어둠 */}
            <div
              className="absolute inset-0"
              style={{
                background: allDone
                  ? `
                    radial-gradient(ellipse 75% 55% at 55% 20%, rgba(143, 184, 141, 0.3) 0%, transparent 55%),
                    radial-gradient(ellipse 100% 80% at 50% 110%, rgba(40, 60, 40, 0.5) 0%, transparent 60%),
                    linear-gradient(180deg, #050706 0%, #000 60%)
                  `
                  : `
                    radial-gradient(ellipse 75% 55% at 55% 20%, rgba(232, 118, 58, 0.28) 0%, transparent 55%),
                    radial-gradient(ellipse 100% 80% at 50% 110%, rgba(60, 25, 12, 0.55) 0%, transparent 60%),
                    linear-gradient(180deg, #0a0604 0%, #000 60%)
                  `,
              }}
            />

            {/* 측면 light spill (한 쪽에서 빛 들어오는 느낌) */}
            <div
              className="absolute inset-0"
              style={{
                background: allDone
                  ? 'radial-gradient(ellipse 35% 60% at 95% 35%, rgba(143, 184, 141, 0.16) 0%, transparent 55%)'
                  : 'radial-gradient(ellipse 35% 60% at 95% 35%, rgba(232, 168, 100, 0.18) 0%, transparent 55%)',
              }}
            />

            {/* 메인 오브 — 더 크고 부드럽게 */}
            <div
              className="absolute -top-24 -right-32 w-[26rem] h-[26rem] rounded-full orb-pulse"
              style={{
                background: allDone ? 'var(--orb-peaceful)' : 'var(--orb-warm)',
                opacity: 0.5,
                filter: 'blur(50px)',
              }}
            />

            {/* 비네트 — 가장자리 더 어둡게 */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)',
              }}
            />

            {/* 그레인 노이즈 — 필름 질감 */}
            <div
              className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* 하단 텍스트용 오버레이 */}
          <div className="absolute inset-0 hero-overlay" />

          {/* 콘텐츠 오버레이 */}
          <div className="relative h-full flex flex-col justify-between p-6">
            {/* 상단 라벨 (Open #4 차용) */}
            <div className="flex items-start justify-between">
              <p className="label-upper">
                Daily Practice · {new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' })}
              </p>
              <span className={cn(
                'label-tag tracking-[0.25em]',
                allDone ? 'text-success' : 'text-foreground-dim',
              )}>
                {completedCount}/3
              </span>
            </div>

            {/* 하단 타이틀 + CTA */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                {allDone ? (
                  <>
                    <p className="label-tag mb-2 text-success">All complete</p>
                    <h2 className="text-[40px] leading-[0.95] tracking-tight text-foreground font-medium">
                      모두<br />완료
                    </h2>
                    <p className="text-foreground-dim text-[13px] mt-4 tracking-wide">
                      {stats.streak}일 연속 수행 중
                    </p>
                  </>
                ) : (
                  <>
                    <p className="label-tag mb-2 text-foreground-dim">
                      {nextPractice!.english} · {nextPractice!.duration}
                    </p>
                    <h2 className="text-[40px] leading-[0.95] tracking-tight text-foreground font-medium">
                      {nextPractice!.label}
                    </h2>
                    <p className="text-foreground-dim text-[12px] mt-3 leading-relaxed line-clamp-2 max-w-[85%] italic">
                      &ldquo;{todayWisdom.text.slice(0, 42)}
                      {todayWisdom.text.length > 42 && '…'}&rdquo;
                    </p>
                  </>
                )}
              </div>

              {!allDone && (
                <Link
                  href={nextPractice!.href}
                  aria-label={`${nextPractice!.label} 시작`}
                  className="group shrink-0 w-14 h-14 rounded-full border border-foreground/30 flex items-center justify-center hover:border-foreground hover:bg-foreground/5 transition-all active:scale-95"
                >
                  <Play size={17} strokeWidth={1.2} className="text-foreground translate-x-[1.5px]" fill="currentColor" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 카드 아래 카테고리 빠른 전환 (Open #4 차용) */}
        <nav className="mt-4 flex items-center gap-5 overflow-x-auto scrollbar-hide">
          {PRACTICES.map(p => {
            const done = status[p.key]
            const isNext = nextPractice?.key === p.key
            return (
              <Link
                key={p.href}
                href={p.href}
                className={cn(
                  'shrink-0 pb-1.5 text-[13px] tracking-tight transition-colors relative',
                  done
                    ? 'text-muted-deep line-through decoration-1'
                    : isNext
                    ? 'text-foreground'
                    : 'text-foreground-dim hover:text-foreground',
                )}
              >
                {p.label}
                {isNext && (
                  <div className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-accent" />
                )}
              </Link>
            )
          })}
          <Link
            href="/sounds"
            className="shrink-0 pb-1.5 text-[13px] text-foreground-dim hover:text-foreground transition-colors tracking-tight"
          >
            사운드
          </Link>
          <Link
            href="/discover"
            className="shrink-0 pb-1.5 text-[13px] text-foreground-dim hover:text-foreground transition-colors tracking-tight"
          >
            전체
          </Link>
        </nav>

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
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/journal" className="text-[15px] text-foreground hover:text-accent transition-colors">
            마음기록 <span className="text-muted text-sm">→</span>
          </Link>
          <Link href="/discover" className="text-[15px] text-foreground hover:text-accent transition-colors">
            둘러보기 <span className="text-muted text-sm">→</span>
          </Link>
          <Link href="/sounds" className="text-[15px] text-foreground hover:text-accent transition-colors">
            사운드 <span className="text-muted text-sm">→</span>
          </Link>
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
