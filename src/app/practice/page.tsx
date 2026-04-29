'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Flame, Wind, Circle, BookOpen } from 'lucide-react'
import { MoodBackdrop } from '@/components/mood-backdrop'

interface PracticeItem {
  href: string
  label: string
  english: string
  description: string
  icon: typeof Flame
  hanja: string
  duration: string
}

const PRACTICES: PracticeItem[] = [
  {
    href: '/bae108',
    label: '108배',
    english: 'Bae 108',
    description: '한 절 한 절, 마음을 내려놓는 시간',
    icon: Flame,
    hanja: '百八拜',
    duration: '약 11분',
  },
  {
    href: '/meditation',
    label: '명상',
    english: 'Meditation',
    description: '호흡과 함께 머무르며 마음을 비우다',
    icon: Wind,
    hanja: '冥想',
    duration: '5–30분',
  },
  {
    href: '/yeomju',
    label: '염불',
    english: 'Yeombul',
    description: '한 마음으로 이름을 외우며 마음을 모은다',
    icon: Circle,
    hanja: '念佛',
    duration: '108염주',
  },
  {
    href: '/sutra',
    label: '경전',
    english: 'Sutra',
    description: '말씀을 따라 읽으며 가르침을 새기다',
    icon: BookOpen,
    hanja: '經典',
    duration: '5–20분',
  },
]

export default function PracticePage() {
  const router = useRouter()

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="indigo" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <button
          onClick={() => router.back()}
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <p className="label-upper">Practice</p>
        <div className="w-8" />
      </header>

      {/* 타이틀 */}
      <section className="px-5 pb-8 animate-in">
        <p className="label-tag mb-2">Daily Practice</p>
        <h1 className="text-foreground text-[28px] tracking-tight font-medium">
          오늘의 수행
        </h1>
        <p className="text-foreground-dim text-[13px] mt-2 leading-relaxed">
          하루의 결을 다듬는 네 가지 수행.
          <br />
          마음 가는 곳에서 시작하세요.
        </p>
      </section>

      {/* 수행 카드 리스트 */}
      <section className="px-5 pb-10 animate-in stagger-1 space-y-2.5">
        {PRACTICES.map((p, idx) => {
          const Icon = p.icon
          return (
            <Link
              key={p.href}
              href={p.href}
              className="group block surface-paper rounded-2xl p-5 hover:bg-[var(--surface-hover)] transition-colors active:scale-[0.99]"
            >
              <div className="flex items-start gap-4">
                {/* 번호 + 아이콘 */}
                <div className="flex flex-col items-center gap-3 pt-1 shrink-0">
                  <span className="label-tag tabular-nums">
                    0{idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full border border-[var(--surface-border)] flex items-center justify-center text-foreground-dim group-hover:text-accent group-hover:border-accent transition-colors">
                    <Icon size={16} strokeWidth={1.5} />
                  </div>
                </div>

                {/* 본문 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h2 className="text-foreground text-[20px] tracking-tight font-medium group-hover:text-accent-light transition-colors">
                      {p.label}
                    </h2>
                    <span className="font-serif italic text-[11px] text-muted-deep tracking-wider">
                      {p.hanja}
                    </span>
                  </div>
                  <p className="label-tag mb-2">
                    {p.english} · {p.duration}
                  </p>
                  <p className="text-foreground-dim text-[13px] leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* 화살표 */}
                <ChevronRight
                  size={16}
                  strokeWidth={1.5}
                  className="text-foreground-dim group-hover:text-accent transition-colors shrink-0 mt-2"
                />
              </div>
            </Link>
          )
        })}
      </section>

      {/* 푸터 (한자) */}
      <footer className="text-center pb-8 mt-auto animate-in stagger-2">
        <p className="font-serif italic text-xs text-muted-deep tracking-wider">
          一念三千
        </p>
        <p className="label-upper text-[9px] text-muted-deep mt-1.5">
          한 생각에 삼천 세계
        </p>
      </footer>
    </div>
  )
}
