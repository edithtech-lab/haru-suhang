'use client'

/**
 * /lab/wisdom-card — 데일리 위즈덤 카드 시안 갤러리
 * Open 인스타 피드 패턴 차용. 6개 톤 비교.
 *
 * 핵심 가설: 이 카드가 마케팅 엔진이 됨.
 * - 앱에서 카드 보기 → 마음에 들면 → 인스타 공유 → 자연 유입
 */

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Heart, Share2 } from 'lucide-react'

type CardVariant = {
  id: string
  name: string
  description: string
  quote: string
  source: string
  /** 사진 placeholder (CSS 그라데이션) */
  image: () => React.ReactNode
}

const VARIANTS: CardVariant[] = [
  {
    id: 'A',
    name: '호박색 합장 (Cinematic)',
    description: '#8 톤 — 짙은 호박/구릿빛, 강한 측면 광',
    quote: '하루를 성실히 보내면, 편안히 잠들 수 있고, 일생을 성실히 보내면, 편안히 갈 수 있느니라.',
    source: '법구경',
    image: () => (
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 70% at 35% 50%, rgba(180, 110, 75, 0.7) 0%, rgba(60, 30, 18, 0.85) 50%, transparent 80%),
              radial-gradient(ellipse 80% 80% at 80% 50%, rgba(90, 45, 25, 0.6) 0%, transparent 70%),
              linear-gradient(180deg, #1a0a04 0%, #050200 100%)
            `,
          }}
        />
        {/* 손 형상 시뮬 */}
        <div
          className="absolute"
          style={{
            top: '20%',
            right: '-10%',
            width: '60%',
            height: '70%',
            borderRadius: '50% 40% 50% 60%',
            background: 'radial-gradient(ellipse at 30% 30%, rgba(190, 130, 90, 0.5) 0%, rgba(50, 25, 15, 0.5) 70%)',
            filter: 'blur(15px)',
          }}
        />
      </div>
    ),
  },
  {
    id: 'B',
    name: '누드 그레이 손 (Intimate)',
    description: '#9 톤 — 부드러운 베이지/그레이, 자연광 매트',
    quote: '걸을 때 걷고, 앉을 때 앉고, 먹을 때 먹으라. 그것이 수행이니라.',
    source: '임제록',
    image: () => (
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, #d8d0c8 0%, #b5ada5 35%, #8a807a 70%, #4a423d 100%)
            `,
          }}
        />
        <div
          className="absolute"
          style={{
            top: '15%',
            left: '-10%',
            width: '70%',
            height: '60%',
            borderRadius: '40% 60% 40% 50%',
            background: 'radial-gradient(ellipse at 50% 40%, rgba(195, 175, 158, 0.7) 0%, rgba(120, 105, 92, 0.5) 60%, transparent 90%)',
            filter: 'blur(8px)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '45%',
            right: '10%',
            width: '40%',
            height: '40%',
            borderRadius: '50% 40% 60% 40%',
            background: 'radial-gradient(ellipse, rgba(170, 145, 125, 0.6) 0%, transparent 70%)',
            filter: 'blur(6px)',
          }}
        />
      </div>
    ),
  },
  {
    id: 'C',
    name: '인물 어깨/목 (모노톤)',
    description: '얼굴 일부만 노출. 익명적·고요함',
    quote: '마음이 고요하면 온 세상이 고요하고, 마음이 맑으면 온 세상이 맑나니.',
    source: '선가귀감',
    image: () => (
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 50% 30%, rgba(60, 50, 45, 0.95) 0%, rgba(20, 15, 12, 0.85) 50%, transparent 80%),
              linear-gradient(180deg, #0a0806 0%, #1a1614 50%, #0a0806 100%)
            `,
          }}
        />
        {/* 어깨/목 형상 */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '50%',
            background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(100, 80, 70, 0.7) 0%, rgba(40, 30, 25, 0.6) 50%, transparent 90%)',
            filter: 'blur(10px)',
          }}
        />
      </div>
    ),
  },
  {
    id: 'D',
    name: '자연 매크로 (그린)',
    description: '잎·물·이끼 클로즈업. 차가운 그린 톤',
    quote: '연꽃은 진흙에서 피어나되 진흙에 물들지 않나니.',
    source: '유마경',
    image: () => (
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 70% at 50% 60%, rgba(60, 95, 70, 0.7) 0%, rgba(25, 45, 35, 0.85) 50%, transparent 90%),
              linear-gradient(180deg, #0a1208 0%, #050f08 100%)
            `,
          }}
        />
        {/* 잎 형상 */}
        <div
          className="absolute"
          style={{
            top: '20%',
            left: '15%',
            width: '70%',
            height: '60%',
            borderRadius: '50% 70% 30% 60%',
            background: 'radial-gradient(ellipse at 40% 40%, rgba(110, 145, 95, 0.55) 0%, rgba(40, 70, 50, 0.4) 60%, transparent 90%)',
            filter: 'blur(12px)',
            transform: 'rotate(15deg)',
          }}
        />
      </div>
    ),
  },
  {
    id: 'E',
    name: '한지 텍스처 (전통)',
    description: '한지·먹·붓 — 한국적 정체성',
    quote: '일체유심조. 모든 것은 오직 마음이 지어내는 것이니라.',
    source: '화엄경',
    image: () => (
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 50% 30%, rgba(220, 200, 170, 0.95) 0%, rgba(180, 155, 125, 0.9) 50%, rgba(120, 95, 70, 0.85) 100%)
            `,
          }}
        />
        {/* 먹 흔적 */}
        <div
          className="absolute"
          style={{
            top: '40%',
            left: '10%',
            width: '40%',
            height: '8%',
            background: 'linear-gradient(90deg, rgba(20, 15, 10, 0.7) 0%, rgba(40, 25, 15, 0.4) 80%, transparent 100%)',
            borderRadius: '40%',
            filter: 'blur(2px)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '55%',
            left: '20%',
            width: '25%',
            height: '6%',
            background: 'linear-gradient(90deg, rgba(20, 15, 10, 0.6) 0%, transparent 100%)',
            borderRadius: '40%',
            filter: 'blur(2px)',
          }}
        />
        {/* 한지 텍스처 */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    ),
  },
  {
    id: 'F',
    name: '달밤 / 인디고',
    description: '깊은 푸른 밤하늘 + 달 광채',
    quote: '집착이 없으면 두려움도 없나니.',
    source: '반야심경',
    image: () => (
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 75% 25%, rgba(220, 200, 170, 0.4) 0%, transparent 50%),
              linear-gradient(180deg, #0a0d20 0%, #050818 50%, #000 100%)
            `,
          }}
        />
        {/* 달 */}
        <div
          className="absolute"
          style={{
            top: '15%',
            right: '20%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #f4ead4 0%, #d8c8a8 50%, transparent 100%)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '5%',
            right: '10%',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232, 213, 184, 0.18) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </div>
    ),
  },
]

function CardFrame({ variant }: { variant: CardVariant }) {
  return (
    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black">
      {variant.image()}

      {/* 그레인 노이즈 */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 인용문 + 출처 (가독성용 그림자 톤) */}
      <div className="absolute inset-0 flex flex-col justify-center p-7">
        <p
          className={`text-[15px] leading-[1.55] tracking-tight ${
            variant.id === 'E' ? 'text-[#1a0e08]' : 'text-white'
          }`}
          style={{
            textShadow: variant.id !== 'E' ? '0 1px 8px rgba(0,0,0,0.5)' : 'none',
            fontWeight: 400,
          }}
        >
          &ldquo;{variant.quote}&rdquo;
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-7 flex items-center justify-between">
        <p
          className={`text-[10px] uppercase tracking-[0.3em] ${
            variant.id === 'E' ? 'text-[#3a2814]' : 'text-white/85'
          }`}
        >
          — {variant.source}
        </p>
      </div>
    </div>
  )
}

export default function WisdomCardLab() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="flex items-center justify-between px-5 pt-5 pb-4 sticky top-0 z-10 bg-black/85 backdrop-blur-sm border-b border-[var(--surface-border)]">
        <Link
          href="/"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Wisdom Card Lab</p>
        <div className="w-8" />
      </header>

      <section className="px-5 py-6 max-w-3xl mx-auto w-full">
        <p className="label-tag mb-3">Lab</p>
        <h1 className="text-foreground text-[28px] tracking-tight font-medium">
          데일리 위즈덤 카드
        </h1>
        <p className="text-foreground-dim text-[13px] mt-2 leading-relaxed">
          Open 인스타 피드 패턴 차용. 매일 다른 카드 → 사용자 인스타 공유 → 자연 유입.
          <br />
          마음에 드는 시안 ID(A~F)를 알려주시면 홈 카드와 공유 시스템을 그 톤으로 구축합니다.
        </p>

        <div className="mt-4 flex items-center gap-3 text-[12px] text-foreground-dim flex-wrap">
          <span className="px-3 py-1.5 rounded-full surface-subtle">
            ♡ 좋아요
          </span>
          <span className="px-3 py-1.5 rounded-full surface-subtle">
            <Share2 size={11} className="inline mr-1" /> 인스타 공유
          </span>
          <span className="px-3 py-1.5 rounded-full surface-subtle">
            ⟶ 다음 카드
          </span>
        </div>
      </section>

      <section className="px-5 pb-24 max-w-3xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
        {VARIANTS.map(v => (
          <div
            key={v.id}
            onClick={() => setActive(v.id)}
            className={`space-y-3 cursor-pointer rounded-2xl p-3 -m-3 transition-colors ${
              active === v.id ? 'bg-[var(--surface)]' : 'hover:bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-baseline justify-between">
              <p className="label-upper text-foreground">
                {v.id}. {v.name}
              </p>
              {active === v.id && (
                <span className="label-tag text-accent">Selected</span>
              )}
            </div>
            <p className="label-tag leading-relaxed">{v.description}</p>
            <CardFrame variant={v} />

            {/* 카드 액션 (좋아요 / 공유 / 다음) */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <button className="text-foreground-dim hover:text-danger transition-colors">
                  <Heart size={16} strokeWidth={1.5} />
                </button>
                <button className="text-foreground-dim hover:text-foreground transition-colors">
                  <Share2 size={16} strokeWidth={1.5} />
                </button>
              </div>
              <p className="label-tag">9:16 · 인스타 스토리</p>
            </div>
          </div>
        ))}
      </section>

      {active && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 surface-paper rounded-full px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3">
          <p className="label-tag">선택: {active}</p>
          <p className="text-foreground text-[13px]">대화창에 &quot;{active}로 가자&quot; 입력</p>
        </div>
      )}
    </div>
  )
}
