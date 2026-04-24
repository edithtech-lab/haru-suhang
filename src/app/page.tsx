'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getTodayStatus, getPracticeStats } from '@/lib/practice-store'
import { DAILY_WISDOMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { AmbientBackdrop } from '@/components/ambient-orb'
import type { DailyStatus, PracticeStats } from '@/types'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const PRACTICES = [
  { href: '/bae108', label: '108배', subtitle: 'One hundred eight bows', key: 'bae108' as const },
  { href: '/meditation', label: '명상', subtitle: 'Meditation', key: 'meditation' as const },
  { href: '/yeomju', label: '염불', subtitle: 'Chanting', key: 'yeobul' as const },
]

const QUICKLINKS = [
  { href: '/sutra', label: '경전', sub: 'Sutras' },
  { href: '/doban', label: '도반', sub: 'Fellowship' },
  { href: '/calendar', label: '기록', sub: 'Records' },
]

export default function HomePage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [status, setStatus] = useState<DailyStatus>({ bae108: false, meditation: false, yeobul: false })
  const [stats, setStats] = useState<PracticeStats>({ streak: 0, totalDays: 0, totalBae108: 0, totalMeditation: 0, totalYeobul: 0 })

  const todayWisdom = DAILY_WISDOMS[new Date().getDate() % DAILY_WISDOMS.length]
  const now = new Date()
  const dayName = WEEKDAYS[now.getDay()]
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 · ${dayName}요일`

  useEffect(() => {
    if (!loading) {
      const userId = user?.id ?? null
      getTodayStatus(userId).then(setStatus)
      getPracticeStats(userId).then(setStats)
    }
  }, [user, loading])

  const completedCount = [status.bae108, status.meditation, status.yeobul].filter(Boolean).length
  const allDone = completedCount === 3

  return (
    <>
      <AmbientBackdrop preset="home" />

      <div className="px-6 pt-16 pb-8">
        {/* ===== 헤더 ===== */}
        <header className="animate-in flex items-start justify-between mb-20">
          <div className="space-y-1">
            <p className="text-[11px] text-muted font-medium uppercase tracking-[0.22em]">
              {dateStr}
            </p>
            <p className="text-xs text-foreground-dim tracking-wide mt-2">
              {now.getFullYear()} · 甲辰年
            </p>
          </div>

          {!loading && (
            user ? (
              <button
                onClick={signOut}
                className="text-[11px] text-muted hover:text-foreground-dim transition-colors flex items-center gap-1.5 tracking-wider"
              >
                <LogOut size={12} />
                <span className="uppercase">Sign out</span>
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="text-[11px] text-accent hover:text-accent-light transition-colors flex items-center gap-1.5 tracking-wider"
              >
                <LogIn size={12} />
                <span className="uppercase">Sign in</span>
              </button>
            )
          )}
        </header>

        {/* ===== 타이틀 (에디토리얼 세리프) ===== */}
        <section className="animate-in stagger-1 mb-24 relative">
          <p className="text-[11px] text-muted-deep uppercase tracking-[0.3em] mb-6">
            Daily Practice
          </p>
          <h1 className="font-serif text-[clamp(3rem,14vw,5.5rem)] leading-[0.95] tracking-tight text-foreground">
            하루<br />
            <span className="italic text-accent-light">수행</span>
          </h1>
          <p className="mt-8 text-[15px] text-foreground-dim leading-relaxed max-w-xs font-serif">
            오늘도 한 호흡, 한 절, 한 마음.<br />
            <span className="text-muted text-sm">Each breath, each bow, each moment.</span>
          </p>
        </section>

        {/* ===== 연속 수행 · 오늘의 진행 ===== */}
        <section className="animate-in stagger-2 mb-24">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-[0.28em] mb-3">
                Streak
              </p>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  'font-serif text-7xl leading-none tracking-tight',
                  stats.streak > 0 ? 'text-accent-light' : 'text-muted-deep'
                )}>
                  {stats.streak}
                </span>
                <span className="text-muted text-sm tracking-widest">DAYS</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-muted uppercase tracking-[0.28em] mb-3">
                Today
              </p>
              <div className="flex items-center gap-1.5 justify-end mb-2">
                {[status.bae108, status.meditation, status.yeobul].map((done, i) => (
                  <div
                    key={i}
                    className={cn(
                      'transition-all duration-500',
                      done ? 'w-8 h-[2px] bg-accent' : 'w-4 h-[2px] bg-muted-deep'
                    )}
                  />
                ))}
              </div>
              <p className="font-serif text-2xl">
                <span className={allDone ? 'text-accent-light shimmer' : 'text-foreground'}>
                  {completedCount}
                </span>
                <span className="text-muted text-sm"> / 3</span>
              </p>
            </div>
          </div>
        </section>

        {/* ===== 오늘의 수행 (에디토리얼 리스트) ===== */}
        <section className="animate-in stagger-3 mb-24">
          <div className="divider-serif mb-10">
            <span className="font-serif italic text-sm text-muted-deep">today's practice</span>
          </div>

          <ul className="space-y-1">
            {PRACTICES.map(({ href, label, subtitle, key }, idx) => {
              const done = status[key]
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'group flex items-center justify-between py-5 transition-colors',
                      idx !== PRACTICES.length - 1 && 'border-b border-[var(--surface-border)]',
                    )}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-serif text-sm text-muted-deep tabular-nums">
                        0{idx + 1}
                      </span>
                      <div>
                        <p className={cn(
                          'font-serif text-2xl tracking-tight transition-colors',
                          done ? 'text-accent-light' : 'text-foreground group-hover:text-accent-light'
                        )}>
                          {label}
                        </p>
                        <p className="text-[11px] text-muted mt-1 tracking-wider uppercase">
                          {subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {done ? (
                        <span className="text-[10px] text-accent uppercase tracking-[0.25em]">
                          Done
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-deep uppercase tracking-[0.25em] group-hover:text-accent transition-colors">
                          Begin →
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        {/* ===== 오늘의 법어 (에디토리얼 인용) ===== */}
        <section className="animate-in stagger-4 mb-24">
          <div className="divider-serif mb-10">
            <span className="font-serif italic text-sm text-muted-deep">wisdom</span>
          </div>

          <figure className="relative">
            <span
              aria-hidden
              className="font-serif absolute -top-8 -left-2 text-7xl text-accent/25 leading-none select-none"
            >
              &ldquo;
            </span>
            <blockquote className="font-serif text-[22px] leading-[1.55] text-foreground/95 tracking-[-0.01em] pl-2">
              {todayWisdom.text}
            </blockquote>
            <figcaption className="mt-6 text-xs text-accent uppercase tracking-[0.28em] text-right">
              — {todayWisdom.source}
            </figcaption>
          </figure>
        </section>

        {/* ===== 누적 수행 (세리프 숫자) ===== */}
        <section className="animate-in stagger-5 mb-24">
          <div className="divider-serif mb-10">
            <span className="font-serif italic text-sm text-muted-deep">records</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: stats.totalBae108, label: '108배', sub: 'bows' },
              { value: stats.totalMeditation, label: '명상', sub: 'min' },
              { value: stats.totalYeobul, label: '염불', sub: 'count' },
            ].map(({ value, label, sub }) => (
              <div key={label} className="text-center py-6 border-t border-[var(--surface-border)]">
                <p className="font-serif text-4xl text-foreground tracking-tight tabular-nums">
                  {value}
                </p>
                <p className="mt-2 text-xs text-muted">{label}</p>
                <p className="text-[10px] text-muted-deep uppercase tracking-[0.25em] mt-0.5">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 바로가기 ===== */}
        <section className="animate-in stagger-6">
          <div className="divider-serif mb-10">
            <span className="font-serif italic text-sm text-muted-deep">more</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {QUICKLINKS.map(({ href, label, sub }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center gap-1 py-6 transition-colors"
              >
                <span className="font-serif text-xl text-foreground group-hover:text-accent-light transition-colors">
                  {label}
                </span>
                <span className="text-[10px] text-muted-deep uppercase tracking-[0.25em]">
                  {sub}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== Footer mark ===== */}
        <footer className="mt-24 text-center animate-in stagger-6">
          <p className="font-serif italic text-xs text-muted-deep tracking-wider">
            念念不離心
          </p>
          <p className="text-[10px] text-muted-deep uppercase tracking-[0.3em] mt-2">
            Every thought, never apart from the heart.
          </p>
        </footer>
      </div>
    </>
  )
}
