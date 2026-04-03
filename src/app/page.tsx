'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Hand, Timer, BookOpen, Calendar, LogIn, LogOut, Flame, CircleDot, Music } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getTodayStatus, getPracticeStats } from '@/lib/practice-store'
import { DAILY_WISDOMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { DailyStatus, PracticeStats } from '@/types'

export default function HomePage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [status, setStatus] = useState<DailyStatus>({ bae108: false, meditation: false, yeobul: false })
  const [stats, setStats] = useState<PracticeStats>({ streak: 0, totalDays: 0, totalBae108: 0, totalMeditation: 0, totalYeobul: 0 })

  const todayWisdom = DAILY_WISDOMS[new Date().getDate() % DAILY_WISDOMS.length]

  useEffect(() => {
    if (!loading) {
      const userId = user?.id ?? null
      getTodayStatus(userId).then(setStatus)
      getPracticeStats(userId).then(setStats)
    }
  }, [user, loading])

  const completedCount = [status.bae108, status.meditation, status.yeobul].filter(Boolean).length

  return (
    <div className="px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">하루수행</h1>
          <p className="text-sm text-muted mt-0.5">오늘도 한 걸음씩</p>
        </div>
        {!loading && (
          user ? (
            <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
              <LogOut size={16} />
              <span>로그아웃</span>
            </button>
          ) : (
            <button onClick={signInWithGoogle} className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-light">
              <LogIn size={16} />
              <span>로그인</span>
            </button>
          )
        )}
      </div>

      {/* 연속 수행 + 오늘 현황 */}
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Flame size={24} className="text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted">연속 수행</p>
            <p className="text-2xl font-bold text-accent">{stats.streak}일</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted">오늘 진행</p>
          <p className="text-lg font-bold text-foreground">{completedCount} / 3</p>
        </div>
      </Card>

      {/* 빠른 시작 */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider">오늘의 수행</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/bae108">
            <Card hover className={cn(
              'flex flex-col items-center gap-2 py-5',
              status.bae108 && 'border-success/50 bg-success/10'
            )}>
              <Hand size={28} className={status.bae108 ? 'text-success' : 'text-accent'} />
              <span className="text-sm font-medium">108배</span>
              {status.bae108 && <span className="text-[10px] text-success">완료</span>}
            </Card>
          </Link>
          <Link href="/meditation">
            <Card hover className={cn(
              'flex flex-col items-center gap-2 py-5',
              status.meditation && 'border-success/50 bg-success/10'
            )}>
              <Timer size={28} className={status.meditation ? 'text-success' : 'text-accent'} />
              <span className="text-sm font-medium">명상</span>
              {status.meditation && <span className="text-[10px] text-success">완료</span>}
            </Card>
          </Link>
          <Link href="/yeobul">
            <Card hover className={cn(
              'flex flex-col items-center gap-2 py-5',
              status.yeobul && 'border-success/50 bg-success/10'
            )}>
              <BookOpen size={28} className={status.yeobul ? 'text-success' : 'text-accent'} />
              <span className="text-sm font-medium">예불</span>
              {status.yeobul && <span className="text-[10px] text-success">완료</span>}
            </Card>
          </Link>
        </div>
      </div>

      {/* 오늘의 법어 */}
      <Card className="space-y-3">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider">오늘의 법어</h2>
        <p className="text-foreground leading-relaxed text-[15px]">
          &ldquo;{todayWisdom.text}&rdquo;
        </p>
        <p className="text-sm text-accent text-right">- {todayWisdom.source}</p>
      </Card>

      {/* 수행 통계 */}
      <Card className="space-y-3">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider">누적 수행</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-accent">{stats.totalBae108}</p>
            <p className="text-xs text-muted">108배</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{stats.totalMeditation}</p>
            <p className="text-xs text-muted">명상</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{stats.totalYeobul}</p>
            <p className="text-xs text-muted">예불</p>
          </div>
        </div>
      </Card>

      {/* 바로가기 */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/yeomju">
          <Card hover className="flex flex-col items-center gap-2 py-4">
            <CircleDot size={20} className="text-accent" />
            <span className="text-xs font-medium">염주</span>
          </Card>
        </Link>
        <Link href="/ambient">
          <Card hover className="flex flex-col items-center gap-2 py-4">
            <Music size={20} className="text-accent" />
            <span className="text-xs font-medium">사찰 음향</span>
          </Card>
        </Link>
        <Link href="/calendar">
          <Card hover className="flex flex-col items-center gap-2 py-4">
            <Calendar size={20} className="text-accent" />
            <span className="text-xs font-medium">캘린더</span>
          </Card>
        </Link>
      </div>
    </div>
  )
}
