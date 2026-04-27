'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { MoodBackdrop } from '@/components/mood-backdrop'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'bae108' | 'meditation' | 'yeobul'

type Category = {
  id: string
  title: string
  subtitle: string
  duration: string
  href: string
  /** Mood gradient — 카드 배경 */
  gradient: string
  category: 'bae108' | 'meditation' | 'yeobul'
}

// 무드별 카드 그라데이션 (인물 사진 placeholder)
const cardGradients = {
  warm:
    'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(232, 118, 58, 0.6) 0%, rgba(60, 25, 12, 0.9) 60%), linear-gradient(180deg, #1a0e08 0%, #000 100%)',
  wine:
    'radial-gradient(ellipse 70% 50% at 60% 30%, rgba(180, 70, 90, 0.55) 0%, rgba(40, 15, 25, 0.9) 60%), linear-gradient(180deg, #150810 0%, #000 100%)',
  olive:
    'radial-gradient(ellipse 70% 50% at 40% 25%, rgba(150, 165, 90, 0.45) 0%, rgba(35, 40, 20, 0.9) 60%), linear-gradient(180deg, #0a0f06 0%, #000 100%)',
  indigo:
    'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(90, 100, 170, 0.5) 0%, rgba(20, 25, 50, 0.9) 60%), linear-gradient(180deg, #0a0d18 0%, #000 100%)',
  navy:
    'radial-gradient(ellipse 70% 50% at 65% 35%, rgba(70, 100, 150, 0.5) 0%, rgba(15, 20, 40, 0.9) 60%), linear-gradient(180deg, #06090f 0%, #000 100%)',
  sepia:
    'radial-gradient(ellipse 70% 50% at 35% 25%, rgba(200, 160, 110, 0.45) 0%, rgba(60, 40, 25, 0.9) 60%), linear-gradient(180deg, #14100a 0%, #000 100%)',
  amber:
    'radial-gradient(ellipse 70% 50% at 55% 30%, rgba(218, 145, 80, 0.55) 0%, rgba(50, 25, 12, 0.9) 60%), linear-gradient(180deg, #150c06 0%, #000 100%)',
  violet:
    'radial-gradient(ellipse 70% 50% at 45% 30%, rgba(140, 95, 180, 0.45) 0%, rgba(30, 20, 45, 0.9) 60%), linear-gradient(180deg, #0c0816 0%, #000 100%)',
}

const CATEGORIES: Category[] = [
  // 108배
  { id: 'morning-108', title: '새벽 108배', subtitle: 'Morning Bow', duration: '15 min', href: '/bae108', gradient: cardGradients.amber, category: 'bae108' },
  { id: 'evening-108', title: '저녁 108배', subtitle: 'Evening Reflection', duration: '15 min', href: '/bae108', gradient: cardGradients.wine, category: 'bae108' },
  { id: 'gratitude-108', title: '감사 108배', subtitle: 'Gratitude', duration: '15 min', href: '/bae108', gradient: cardGradients.sepia, category: 'bae108' },
  { id: 'wish-108', title: '발원 108배', subtitle: 'Vow', duration: '15 min', href: '/bae108', gradient: cardGradients.olive, category: 'bae108' },

  // 명상
  { id: 'short-meditation', title: '짧은 명상', subtitle: 'Quick Reset', duration: '5 min', href: '/meditation', gradient: cardGradients.indigo, category: 'meditation' },
  { id: 'breath-meditation', title: '호흡 명상', subtitle: 'Breath Focus', duration: '15 min', href: '/meditation', gradient: cardGradients.navy, category: 'meditation' },
  { id: 'loving-kindness', title: '자비 명상', subtitle: 'Loving-kindness', duration: '20 min', href: '/meditation', gradient: cardGradients.violet, category: 'meditation' },
  { id: 'deep-meditation', title: '깊은 명상', subtitle: 'Deep Stillness', duration: '30 min', href: '/meditation', gradient: cardGradients.indigo, category: 'meditation' },

  // 염불
  { id: 'banya', title: '반야심경', subtitle: '般若心經', duration: '5 min', href: '/yeomju', gradient: cardGradients.sepia, category: 'yeobul' },
  { id: 'amita', title: '나무아미타불', subtitle: 'Amitabha', duration: '10 min', href: '/yeomju', gradient: cardGradients.amber, category: 'yeobul' },
  { id: 'gwanseum', title: '관세음보살', subtitle: 'Avalokitesvara', duration: '10 min', href: '/yeomju', gradient: cardGradients.warm, category: 'yeobul' },
  { id: 'om-mani', title: '옴마니반메훔', subtitle: 'Om Mani Padme Hum', duration: '7 min', href: '/yeomju', gradient: cardGradients.wine, category: 'yeobul' },
]

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'bae108', label: '108배' },
  { id: 'meditation', label: '명상' },
  { id: 'yeobul', label: '염불' },
]

export default function DiscoverPage() {
  const [tab, setTab] = useState<Tab>('all')

  const filtered =
    tab === 'all' ? CATEGORIES : CATEGORIES.filter(c => c.category === tab)

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col pb-24">
      <MoodBackdrop mood="charcoal" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link
          href="/"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Discover</p>
        <div className="w-8" />
      </header>

      {/* 상단 4탭 */}
      <nav className="px-5 pb-5 flex items-center gap-5 border-b border-[var(--surface-border)]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'pb-2 text-[15px] tracking-tight transition-all relative',
              tab === t.id ? 'text-foreground' : 'text-muted hover:text-foreground-dim',
            )}
          >
            {t.label}
            {tab === t.id && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-foreground" />
            )}
          </button>
        ))}
        <div className="ml-auto">
          <button
            aria-label="검색"
            className="p-2 text-foreground-dim hover:text-foreground transition-colors"
          >
            <Search size={16} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* All 탭 — 큰 텍스트 메뉴 (Open #7 차용) */}
      {tab === 'all' && (
        <section className="animate-in px-5 py-7 border-b border-[var(--surface-border)]">
          <ul className="space-y-2">
            {[
              { label: 'RECENTS', href: '/calendar', sub: '최근 수행' },
              { label: 'LIBRARY', href: '/sutra', sub: '경전' },
              { label: 'TIMER', href: '/meditation', sub: '명상 타이머' },
              { label: 'JOURNAL', href: '/journal', sub: '마음기록' },
            ].map(item => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="group flex items-baseline justify-between py-1.5 hover:text-accent transition-colors"
                >
                  <span className="text-[28px] tracking-tight text-foreground group-hover:text-accent-light">
                    {item.label}
                  </span>
                  <span className="label-tag">{item.sub}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* For You 큐레이션 라벨 */}
      <div className="px-5 pt-7 pb-4 flex items-center justify-between">
        <p className="label-upper">
          {tab === 'all' ? 'For You' : TABS.find(t => t.id === tab)?.label}
        </p>
        <span className="label-tag">{filtered.length} sessions</span>
      </div>

      {/* 카테고리 그리드 */}
      <section className="animate-in stagger-1 px-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((card, idx) => (
            <Link
              key={card.id}
              href={card.href}
              className={cn(
                'group relative rounded-2xl overflow-hidden aspect-[3/4] transition-all active:scale-[0.98]',
                idx === 0 && tab === 'all' ? 'col-span-2 aspect-[16/9]' : '',
              )}
              style={{ background: card.gradient }}
            >
              {/* 그레인 오버레이 */}
              <div
                className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                }}
              />

              {/* 비네트 (가독성) */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.7) 100%)',
                }}
              />

              {/* 콘텐츠 */}
              <div className="relative h-full flex flex-col justify-between p-4">
                {/* 좌상단 라벨 (큰 흰 텍스트) */}
                <div>
                  <h3 className="text-foreground text-[22px] leading-[1.05] tracking-tight font-medium">
                    {card.title}
                  </h3>
                  <p className="label-tag mt-1.5 text-foreground-dim">
                    {card.subtitle}
                  </p>
                </div>

                {/* 좌하단 메타 */}
                <div className="flex items-baseline justify-between">
                  <span className="label-tag">
                    {card.duration}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-foreground-dim group-hover:text-accent transition-colors">
                    Begin →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
