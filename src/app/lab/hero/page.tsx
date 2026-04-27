'use client'

/**
 * /lab/hero — 홈 히어로 카드 시안 갤러리
 * 6가지 다른 비주얼 시안을 비교하기 위한 개발자 전용 페이지
 *
 * 마음에 드는 시안 번호를 알려주면 홈 페이지에 적용함.
 */

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Play } from 'lucide-react'

type SeenVariant = {
  id: string
  name: string
  description: string
  render: () => React.ReactNode
}

// 공통 오버레이 (텍스트 가독성용)
function HeroOverlay({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, transparent 55%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div className="relative h-full flex flex-col justify-between p-6">
        {children}
      </div>
    </>
  )
}

function HeroContent() {
  return (
    <>
      <div className="flex items-start justify-between">
        <p className="label-upper">Daily Practice · 4. 27. (월)</p>
        <p className="label-tag">0/3</p>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="label-tag mb-2 text-foreground-dim">Bow · 10 min</p>
          <h2 className="text-[40px] leading-[0.95] tracking-tight text-foreground font-medium">
            108배
          </h2>
        </div>
        <button
          aria-label="시작"
          className="shrink-0 w-14 h-14 rounded-full border border-foreground/30 hover:border-foreground hover:bg-foreground/5 flex items-center justify-center transition-all active:scale-95"
        >
          <Play size={17} strokeWidth={1.2} className="text-foreground translate-x-[1.5px]" fill="currentColor" />
        </button>
      </div>
    </>
  )
}

const VARIANTS: SeenVariant[] = [
  {
    id: 'A',
    name: '현재 (다층 그라데이션)',
    description: '기존 v2.2 — 작은 오브 + 다층 lighting + 비네트',
    render: () => (
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 75% 55% at 55% 20%, rgba(232, 118, 58, 0.28) 0%, transparent 55%),
              radial-gradient(ellipse 100% 80% at 50% 110%, rgba(60, 25, 12, 0.55) 0%, transparent 60%),
              linear-gradient(180deg, #0a0604 0%, #000 60%)
            `,
          }}
        />
        <div
          className="absolute -top-24 -right-32 w-[26rem] h-[26rem] rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #f4a56f 0%, #c45624 55%, #1a0e08 100%)',
            opacity: 0.5,
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)',
          }}
        />
        <HeroOverlay>
          <HeroContent />
        </HeroOverlay>
      </div>
    ),
  },
  {
    id: 'B',
    name: 'Open 스타일 거대 오브',
    description: '단일 큰 구릿빛 오브가 화면 우측 상단을 압도 (Open #7 차용)',
    render: () => (
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black">
        {/* 거대 오브 */}
        <div
          className="absolute -top-12 -right-20 w-[140%] aspect-square rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 35%, #d68450 0%, #a8542a 40%, #5a2812 75%, #1a0a04 100%)',
          }}
        />
        {/* 좌하단 그림자 */}
        <div
          className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(60, 25, 12, 0.5) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        {/* 그레인 */}
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />
        <HeroOverlay>
          <HeroContent />
        </HeroOverlay>
      </div>
    ),
  },
  {
    id: 'C',
    name: '인물 실루엣 시뮬',
    description: '블러된 인물 클로즈업 느낌 + 오렌지 광원 (Open 스플래시 차용)',
    render: () => (
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 65% 55% at 50% 35%, rgba(180, 130, 100, 0.55) 0%, rgba(80, 50, 40, 0.7) 35%, transparent 65%),
              radial-gradient(ellipse 90% 70% at 50% 100%, rgba(0, 0, 0, 0.85) 0%, transparent 70%),
              linear-gradient(180deg, #1a0f08 0%, #050302 60%, #000 100%)
            `,
          }}
        />
        {/* 측면 광택 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 28% 38% at 78% 30%, rgba(232, 168, 110, 0.3) 0%, transparent 55%),
              radial-gradient(ellipse 23% 28% at 22% 24%, rgba(180, 110, 70, 0.22) 0%, transparent 55%)
            `,
            filter: 'blur(2px)',
          }}
        />
        {/* 코 그림자 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 12% 25% at 50% 55%, rgba(0, 0, 0, 0.5) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
        <div className="absolute inset-0 backdrop-blur-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }} />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
          }}
        />
        <HeroOverlay>
          <HeroContent />
        </HeroOverlay>
      </div>
    ),
  },
  {
    id: 'D',
    name: '풍경 (산수 일출)',
    description: '겹쳐진 산 실루엣 + 떠오르는 해 그라데이션',
    render: () => (
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black">
        {/* 하늘 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, #2a1408 0%, #4a2010 25%, #6a3018 45%, #2a1408 70%, #050302 100%)
            `,
          }}
        />
        {/* 태양 */}
        <div
          className="absolute"
          style={{
            top: '38%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #f4b078 0%, #d68450 40%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '42%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff5e0 0%, #f4b078 60%, transparent 100%)',
          }}
        />
        {/* 산 1 */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 200" preserveAspectRatio="none" style={{ height: '50%' }}>
          <path d="M0 200 L0 130 Q60 90 130 110 Q200 130 270 80 Q330 50 400 90 L400 200 Z" fill="#0a0604" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 200" preserveAspectRatio="none" style={{ height: '35%' }}>
          <path d="M0 200 L0 150 Q80 110 160 130 Q240 150 320 100 Q360 80 400 110 L400 200 Z" fill="#000" opacity="0.85" />
        </svg>
        <HeroOverlay>
          <HeroContent />
        </HeroOverlay>
      </div>
    ),
  },
  {
    id: 'E',
    name: '달밤 / 별빛',
    description: '깊은 인디고 밤하늘 + 옅은 달 + 미세한 별',
    render: () => (
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 50% 100%, rgba(20, 25, 50, 0.8) 0%, transparent 70%),
              linear-gradient(180deg, #0a0d18 0%, #050810 60%, #000 100%)
            `,
          }}
        />
        {/* 달 */}
        <div
          className="absolute"
          style={{
            top: '15%',
            right: '15%',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #e8d5b8 0%, #b89878 60%, transparent 100%)',
            filter: 'blur(0.5px)',
          }}
        />
        {/* 달 글로우 */}
        <div
          className="absolute"
          style={{
            top: '8%',
            right: '8%',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232, 213, 184, 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        {/* 별들 */}
        {[
          { x: '15%', y: '20%', s: 1.2 },
          { x: '70%', y: '30%', s: 0.8 },
          { x: '40%', y: '15%', s: 1 },
          { x: '85%', y: '50%', s: 0.6 },
          { x: '25%', y: '40%', s: 0.7 },
          { x: '55%', y: '55%', s: 1 },
          { x: '10%', y: '60%', s: 0.5 },
          { x: '80%', y: '70%', s: 0.8 },
        ].map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: star.x,
              top: star.y,
              width: `${star.s * 2}px`,
              height: `${star.s * 2}px`,
              opacity: 0.6,
              boxShadow: `0 0 ${star.s * 4}px rgba(255,255,255,0.5)`,
            }}
          />
        ))}
        <HeroOverlay>
          <HeroContent />
        </HeroOverlay>
      </div>
    ),
  },
  {
    id: 'F',
    name: '블러 광원 + 인물 (몽환)',
    description: '강한 블러 + 인물 그림자 시뮬 + 광선 (가장 몽환적)',
    render: () => (
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 75% 50% at 30% 30%, rgba(220, 140, 100, 0.4) 0%, transparent 60%),
              radial-gradient(ellipse 65% 50% at 75% 70%, rgba(160, 80, 60, 0.35) 0%, transparent 60%),
              radial-gradient(ellipse 40% 35% at 55% 45%, rgba(100, 50, 40, 0.4) 0%, transparent 70%),
              linear-gradient(180deg, #1a0a04 0%, #050200 60%, #000 100%)
            `,
            filter: 'saturate(1.2)',
          }}
        />
        {/* 인물 그림자 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 25% 50% at 35% 50%, rgba(0, 0, 0, 0.6) 0%, transparent 70%),
              radial-gradient(ellipse 20% 30% at 65% 65%, rgba(0, 0, 0, 0.5) 0%, transparent 70%)
            `,
            filter: 'blur(15px)',
          }}
        />
        {/* 광선 */}
        <div
          className="absolute"
          style={{
            top: '0',
            right: '15%',
            width: '2px',
            height: '60%',
            background: 'linear-gradient(180deg, rgba(255, 200, 150, 0.4) 0%, transparent 100%)',
            filter: 'blur(8px)',
            transform: 'rotate(15deg)',
          }}
        />
        <div className="absolute inset-0 backdrop-blur-3xl" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }} />
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E")`,
          }}
        />
        <HeroOverlay>
          <HeroContent />
        </HeroOverlay>
      </div>
    ),
  },
]

export default function HeroLabPage() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="flex items-center justify-between px-5 pt-5 pb-4 sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-[var(--surface-border)]">
        <Link
          href="/"
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <p className="label-upper">Hero Lab</p>
        <div className="w-8" />
      </header>

      <section className="px-5 py-6 max-w-3xl mx-auto w-full">
        <p className="label-tag mb-3">Lab</p>
        <h1 className="text-foreground text-[28px] tracking-tight font-medium">
          홈 히어로 시안
        </h1>
        <p className="text-foreground-dim text-[13px] mt-2 leading-relaxed">
          6가지 비주얼을 비교하고, 마음에 드는 시안의 ID(A~F)를 알려주시면 홈 페이지에 적용합니다.
          이미지 자리는 <span className="text-foreground">Gemini Image API</span>로 실제 사진을 생성해 교체할 수도 있어요.
        </p>
      </section>

      <section className="px-5 pb-12 max-w-3xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
        {VARIANTS.map(v => (
          <div
            key={v.id}
            className={`space-y-3 cursor-pointer rounded-2xl p-3 -m-3 transition-colors ${active === v.id ? 'bg-[var(--surface)]' : 'hover:bg-[var(--surface)]'}`}
            onClick={() => setActive(v.id)}
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
            {v.render()}
          </div>
        ))}
      </section>

      {active && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 surface-paper rounded-full px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3">
          <p className="label-tag">선택: {active}</p>
          <p className="text-foreground text-[13px]">대화창에 "{active}로 적용" 라고 알려주세요</p>
        </div>
      )}
    </div>
  )
}
