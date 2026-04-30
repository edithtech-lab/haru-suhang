'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Search, Check, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getTodayStatus, getPracticeStats } from '@/lib/practice-store'
import { getOrCreateProfile } from '@/lib/group-store'
import { DAILY_WISDOMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { MoodBackdrop } from '@/components/mood-backdrop'
import { FavoriteButton } from '@/components/favorite-button'
import type { DailyStatus, PracticeStats } from '@/types'

const PRACTICES = [
  { href: '/bae108', label: '108배', english: 'Bow', duration: '10 min', key: 'bae108' as const },
  { href: '/meditation', label: '명상', english: 'Meditate', duration: '15 min', key: 'meditation' as const },
  { href: '/yeomju', label: '염불', english: 'Chant', duration: '10 min', key: 'yeobul' as const },
]

// 시간대 × 요일 매트릭스 — 매번 들어올 때마다 다른 추천
type RecommendedKey = 'bae108' | 'meditation' | 'yeobul'
interface Recommendation {
  key: RecommendedKey
  label: string
  english: string
  duration: string
  href: string
}

const RECOMMENDATIONS: Record<string, Recommendation> = {
  'morning-108':       { key: 'bae108',     label: '새벽 108배',  english: 'Morning Bow',       duration: '15 min', href: '/bae108?theme=morning' },
  'evening-108':       { key: 'bae108',     label: '저녁 108배',  english: 'Evening Reflection', duration: '15 min', href: '/bae108?theme=evening' },
  'gratitude-108':     { key: 'bae108',     label: '감사 108배',  english: 'Gratitude',         duration: '15 min', href: '/bae108?theme=gratitude' },
  'wish-108':          { key: 'bae108',     label: '발원 108배',  english: 'Vow',               duration: '15 min', href: '/bae108?theme=wish' },
  'short-meditation':  { key: 'meditation', label: '짧은 명상',   english: 'Quick Reset',       duration: '5 min',  href: '/meditation?duration=300' },
  'breath-meditation': { key: 'meditation', label: '호흡 명상',   english: 'Breath Focus',      duration: '15 min', href: '/meditation?duration=900' },
  'loving-kindness':   { key: 'meditation', label: '자비 명상',   english: 'Loving-kindness',   duration: '20 min', href: '/meditation?duration=1200' },
  'deep-meditation':   { key: 'meditation', label: '깊은 명상',   english: 'Deep Stillness',    duration: '30 min', href: '/meditation?duration=1800' },
  'banya':             { key: 'yeobul',     label: '반야심경',    english: '般若心經',           duration: '5 min',  href: '/yeomju?mode=dokgyeong&sutra=반야심경' },
  'amita':             { key: 'yeobul',     label: '나무아미타불', english: 'Amitabha',          duration: '10 min', href: '/yeomju?mantra=namu-amitabul' },
  'gwanseum':          { key: 'yeobul',     label: '관세음보살',  english: 'Avalokitesvara',    duration: '10 min', href: '/yeomju?mantra=namu-gwaneum' },
  'om-mani':           { key: 'yeobul',     label: '옴마니반메훔', english: 'Om Mani Padme Hum', duration: '7 min',  href: '/yeomju?mantra=om-mani' },
}

function getTodayRecommendation(): Recommendation {
  const h = new Date().getHours()
  const day = new Date().getDay() // 0=일~6=토
  const isOdd = day % 2 === 1

  let id: keyof typeof RECOMMENDATIONS
  if (h < 9) id = isOdd ? 'morning-108' : 'breath-meditation'
  else if (h < 12) id = isOdd ? 'short-meditation' : 'banya'
  else if (h < 15) id = isOdd ? 'breath-meditation' : 'amita'
  else if (h < 18) id = isOdd ? 'gratitude-108' : 'loving-kindness'
  else if (h < 21) id = isOdd ? 'wish-108' : 'gwanseum'
  else id = isOdd ? 'om-mani' : 'deep-meditation'

  return RECOMMENDATIONS[id]
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

// 시간대별 짧은 한국어 메시지 (매일 같은 시간대 = 같은 메시지)
const TIME_MESSAGES: Record<string, string[]> = {
  dawn: [
    '고요한 새벽, 마음을 여세요',
    '하루의 첫 호흡',
    '새벽의 정적 속에서',
    '맑은 새벽 공기를 들이쉬어요',
  ],
  morning: [
    '한 호흡 깊게 쉬어볼까요',
    '오늘도 한 걸음씩',
    '아침의 마음 한 자락',
    '천천히, 그러나 멈추지 않게',
  ],
  afternoon: [
    '잠시 멈춤이 필요한 시간',
    '오후의 고요',
    '한 박자 쉬어가세요',
    '바쁜 마음을 내려놓아요',
  ],
  evening: [
    '오늘 하루 수고하셨어요',
    '저녁의 평온',
    '내려놓을 시간',
    '하루를 가만히 돌아보세요',
  ],
  night: [
    '고요한 밤이에요',
    '잠들기 전 한 호흡',
    '오늘도 무사히 닿았네요',
    '내일을 위해 마음을 비워요',
  ],
}

function getTimeMessage(): string {
  const h = new Date().getHours()
  let bucket: keyof typeof TIME_MESSAGES
  if (h < 5) bucket = 'night'
  else if (h < 9) bucket = 'dawn'
  else if (h < 13) bucket = 'morning'
  else if (h < 17) bucket = 'afternoon'
  else if (h < 22) bucket = 'evening'
  else bucket = 'night'
  const list = TIME_MESSAGES[bucket]
  // 날짜 + 시간대로 결정 (같은 시간대 안에서는 일관, 매일 다름)
  return list[new Date().getDate() % list.length]
}

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const [status, setStatus] = useState<DailyStatus>({ bae108: false, meditation: false, yeobul: false })
  const [stats, setStats] = useState<PracticeStats>({ streak: 0, totalDays: 0, totalBae108: 0, totalMeditation: 0, totalYeobul: 0 })

  const todayWisdomIdx = new Date().getDate() % DAILY_WISDOMS.length
  const todayWisdom = DAILY_WISDOMS[todayWisdomIdx]
  const greeting = getGreeting()
  const timeMessage = getTimeMessage()
  const [displayName, setDisplayName] = useState<string | null>(null)

  // 로그인 시 user_profiles에서 표시 이름 가져오기
  useEffect(() => {
    if (user) {
      getOrCreateProfile(user.id)
        .then(p => setDisplayName(p.display_name))
        .catch(() => setDisplayName(null))
    } else {
      setDisplayName(null)
    }
  }, [user])

  const fallbackName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    null
  const userName = displayName || fallbackName

  useEffect(() => {
    if (!loading) {
      const userId = user?.id ?? null
      getTodayStatus(userId).then(setStatus)
      getPracticeStats(userId).then(setStats)
    }
  }, [user, loading])

  // 시간대 × 요일 큐레이션 (매번 들어올 때마다 다른 추천)
  const recommendation = getTodayRecommendation()
  const completedCount = [status.bae108, status.meditation, status.yeobul].filter(Boolean).length
  const allDone = completedCount === 3

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
            <span className="text-foreground">
              {userName ? `${userName} 수행자님` : '수행자'}
            </span>
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

      {/* ===== 히어로 — Open 시네마틱 lighting + 실사 이미지 ===== */}
      <section className="animate-in stagger-1 px-5 mb-8">
        <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-black">
          {/* 1. 폴백 그라데이션 — 이미지 없거나 로드 전에 보임 */}
          <div className="absolute inset-0">
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
            <div
              className="absolute inset-0"
              style={{
                background: allDone
                  ? 'radial-gradient(ellipse 35% 60% at 95% 35%, rgba(143, 184, 141, 0.16) 0%, transparent 55%)'
                  : 'radial-gradient(ellipse 35% 60% at 95% 35%, rgba(232, 168, 100, 0.18) 0%, transparent 55%)',
              }}
            />
            <div
              className="absolute -top-24 -right-32 w-[26rem] h-[26rem] rounded-full orb-pulse"
              style={{
                background: allDone ? 'var(--orb-peaceful)' : 'var(--orb-warm)',
                opacity: 0.5,
                filter: 'blur(50px)',
              }}
            />
          </div>

          {/* 2. 실사 이미지 — 즉시 표시 (페이드 없음) */}
          <Image
            src="/images/hero/anjali.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 512px) 100vw, 512px"
            className="object-cover"
          />

          {/* 3. 컬러 톤 오버레이 — 사진 위에 앱 액센트 톤 살짝 덮음 */}
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-multiply pointer-events-none"
            style={{
              background: allDone
                ? 'linear-gradient(135deg, rgba(143, 184, 141, 0.18) 0%, rgba(40, 60, 40, 0.25) 100%)'
                : 'linear-gradient(135deg, rgba(196, 86, 36, 0.22) 0%, rgba(40, 18, 10, 0.32) 100%)',
              opacity: 0.85,
            }}
          />

          {/* 4. 따뜻한 글로우 — 우상단 부드러운 광원 */}
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-overlay pointer-events-none"
            style={{
              background: allDone
                ? 'radial-gradient(ellipse 65% 50% at 75% 22%, rgba(180, 220, 180, 0.3) 0%, transparent 65%)'
                : 'radial-gradient(ellipse 65% 50% at 75% 22%, rgba(244, 165, 111, 0.32) 0%, transparent 65%)',
            }}
          />

          {/* 5. 비네트 — 가장자리 어둡게 */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)',
            }}
          />

          {/* 6. 그레인 노이즈 — 필름 질감 */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
            }}
          />

          {/* 7. 하단 텍스트용 오버레이 — 더 강하게 */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, transparent 45%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.85) 100%)',
            }}
          />

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
                    <p className="text-foreground-dim text-[12px] mb-2 tracking-wide">
                      {timeMessage}
                    </p>
                    <p className="label-tag mb-2 text-foreground-dim">
                      {recommendation.english} · {recommendation.duration}
                    </p>
                    <h2 className="text-[40px] leading-[0.95] tracking-tight text-foreground font-medium">
                      {recommendation.label}
                    </h2>
                    <p className="text-foreground-dim text-[11px] mt-3 leading-relaxed line-clamp-2 max-w-[85%] italic">
                      &ldquo;{todayWisdom.text.slice(0, 42)}
                      {todayWisdom.text.length > 42 && '…'}&rdquo;
                    </p>
                  </>
                )}
              </div>

              {!allDone && (
                <Link
                  href={recommendation.href}
                  aria-label={`${recommendation.label} 시작`}
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
            const isNext = !done && recommendation.key === p.key
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

      {/* ===== 오늘의 한마디 — 즐겨찾기 가능 카드 ===== */}
      <section className="animate-in stagger-3 px-5 mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <p className="label-tag">오늘의 한마디</p>
          <p className="label-upper text-[9px] text-muted-deep">
            {new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' })}
          </p>
        </div>
        <div className="surface-paper rounded-2xl p-5">
          <blockquote className="text-[16px] leading-[1.75] text-foreground tracking-tight mb-4 font-serif italic">
            &ldquo;{todayWisdom.text}&rdquo;
          </blockquote>
          <div className="flex items-center justify-between">
            <p className="label-upper text-[10px] text-foreground-dim">
              — {todayWisdom.source}
            </p>
            <FavoriteButton
              id={`wisdom-${todayWisdomIdx}`}
              type="wisdom"
              content={todayWisdom.text}
              meta={{ source: todayWisdom.source }}
              size={16}
            />
          </div>
        </div>
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
