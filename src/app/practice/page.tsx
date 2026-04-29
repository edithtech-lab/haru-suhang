'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { MoodBackdrop } from '@/components/mood-backdrop'

interface PracticeItem {
  href: string
  label: string
  english: string
  description: string
  hanja: string
  duration: string
}

const PRACTICES: PracticeItem[] = [
  {
    href: '/bae108',
    label: '108배',
    english: 'Bae 108',
    description: '한 절 한 절 마음을 내려놓는 시간',
    hanja: '百八拜',
    duration: '약 11분',
  },
  {
    href: '/meditation',
    label: '명상',
    english: 'Meditation',
    description: '호흡과 함께 머무르며 마음을 비우다',
    hanja: '冥想',
    duration: '5–30분',
  },
  {
    href: '/yeomju',
    label: '염불',
    english: 'Yeombul',
    description: '한 마음으로 이름을 외우며 마음을 모은다',
    hanja: '念佛',
    duration: '108염주',
  },
  {
    href: '/sutra',
    label: '경전',
    english: 'Sutra',
    description: '말씀을 따라 읽으며 가르침을 새기다',
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
      </section>

      {/* 메뉴 리스트 — ME 페이지와 동일한 톤 */}
      <section className="animate-in stagger-1 px-5 pb-8">
        <ul className="space-y-0">
          {PRACTICES.map((item, idx) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-baseline justify-between gap-4 py-5 border-b border-[var(--surface-border)] hover:bg-[var(--surface)] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-baseline gap-4 flex-1 min-w-0">
                  <span className="label-tag tabular-nums w-5 shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-foreground text-[18px] tracking-tight group-hover:text-accent-light transition-colors">
                        {item.label}
                      </p>
                      <span className="font-serif italic text-[10px] text-muted-deep tracking-wider">
                        {item.hanja}
                      </span>
                    </div>
                    <p className="label-tag mt-1 truncate">
                      {item.english} · {item.duration}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  strokeWidth={1.5}
                  className="text-foreground-dim group-hover:text-accent transition-colors shrink-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 푸터 */}
      <footer className="text-center pb-8 mt-auto animate-in stagger-2">
        <p className="font-serif italic text-xs text-muted-deep tracking-wider">
          一念三千
        </p>
      </footer>
    </div>
  )
}
