'use client'

/**
 * /lab/hero-photos — 홈 히어로 합장 사진 시안 갤러리
 * 10장의 변주를 비교하고 마음에 드는 ID를 알려주면 메인으로 적용.
 */

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeft, Play } from 'lucide-react'

const VARIANTS = [
  { id: 'v01', label: '정면 합장', sub: 'Frontal · Amber' },
  { id: 'v02', label: '탑다운', sub: 'Top-down · Wood' },
  { id: 'v03', label: '옆 실루엣', sub: 'Side · Backlight' },
  { id: 'v04', label: '손가락 매크로', sub: 'Macro · Fingertips' },
  { id: 'v05', label: '염주 함께', sub: 'With Mala' },
  { id: 'v06', label: '새벽 푸른빛', sub: 'Dawn · Cool' },
  { id: 'v07', label: '황혼 적색', sub: 'Dusk · Red rim' },
  { id: 'v08', label: '한지 배경', sub: 'Hanji · Sepia' },
  { id: 'v09', label: '향연 (인센스)', sub: 'Incense · Smoke' },
  { id: 'v10', label: '달빛 합장', sub: 'Moonlight · Silver' },
]

const QUOTE = '"하루를 성실히 보내면, 편안히 잠들 수 있고…"'

export default function HeroPhotosLab() {
  const [active, setActive] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

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
        <p className="label-upper">Hero Photo Lab</p>
        <div className="w-8" />
      </header>

      <section className="px-5 py-6 max-w-3xl mx-auto w-full">
        <p className="label-tag mb-3">Lab · 10 variants</p>
        <h1 className="text-foreground text-[28px] tracking-tight font-medium">
          합장 시안
        </h1>
        <p className="text-foreground-dim text-[13px] mt-2 leading-relaxed">
          Gemini 2.5 Flash Image로 생성된 10장의 합장 변주.
          <br />
          마음에 드는 ID(v01~v10)를 알려주시면 홈 메인 이미지로 적용합니다.
          <br />
          <span className="text-foreground-dim/70">탭하여 큰 미리보기를 볼 수 있어요.</span>
        </p>
      </section>

      <section className="px-5 pb-24 max-w-3xl mx-auto w-full grid grid-cols-2 gap-3">
        {VARIANTS.map(v => (
          <button
            key={v.id}
            onClick={() => {
              setActive(v.id)
              setPreview(v.id)
            }}
            className={`group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0a0604] transition-all active:scale-[0.98] ${
              active === v.id ? 'ring-2 ring-accent' : 'ring-1 ring-transparent hover:ring-foreground/20'
            }`}
          >
            <Image
              src={`/images/hero/lab/anjali-${v.id}.webp`}
              alt={v.label}
              fill
              sizes="(max-width: 640px) 50vw, 280px"
              className="object-cover"
            />
            {/* 미니 hero 카드 시뮬레이션 (실제 적용 시 모습) */}
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-multiply pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(196, 86, 36, 0.18) 0%, rgba(40, 18, 10, 0.28) 100%)',
                opacity: 0.7,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, transparent 0%, transparent 55%, rgba(0,0,0,0.85) 100%)',
              }}
            />

            {/* 좌상단 ID 라벨 */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
              <p className="label-tag text-foreground/90">{v.id}</p>
              {active === v.id && (
                <span className="label-tag text-accent">Selected</span>
              )}
            </div>

            {/* 하단 정보 + 미니 카드 시뮬 */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
              <div className="text-left">
                <p className="text-foreground text-[13px] tracking-tight font-medium leading-tight">
                  {v.label}
                </p>
                <p className="label-tag mt-0.5 text-[8px]">{v.sub}</p>
              </div>
              <div className="shrink-0 w-7 h-7 rounded-full border border-foreground/40 flex items-center justify-center">
                <Play size={9} strokeWidth={1.5} fill="currentColor" className="text-foreground translate-x-[1px]" />
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* 큰 미리보기 모달 */}
      {preview && (
        <div
          className="fixed inset-0 z-30 bg-black/90 backdrop-blur-md flex items-center justify-center p-5"
          onClick={() => setPreview(null)}
        >
          <div className="max-w-md w-full">
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden">
              <Image
                src={`/images/hero/lab/anjali-${preview}.webp`}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 512px"
                className="object-cover"
                priority
              />
              {/* 실제 적용 시 모습 시뮬 — 색조 + 글로우 + 비네트 + 하단 그림자 */}
              <div
                aria-hidden
                className="absolute inset-0 mix-blend-multiply pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(196, 86, 36, 0.22) 0%, rgba(40, 18, 10, 0.32) 100%)',
                  opacity: 0.85,
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 mix-blend-overlay pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 65% 50% at 75% 22%, rgba(244, 165, 111, 0.32) 0%, transparent 65%)',
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)',
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 0%, transparent 45%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.85) 100%)',
                }}
              />

              {/* 시뮬 콘텐츠 */}
              <div className="relative h-full flex flex-col justify-between p-5">
                <div className="flex items-start justify-between">
                  <p className="label-upper">Daily Practice · 4. 28. (화)</p>
                  <p className="label-tag">0/3</p>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="label-tag mb-1.5">Bow · 10 min</p>
                    <h2 className="text-[36px] leading-[0.95] tracking-tight text-foreground font-medium">
                      108배
                    </h2>
                    <p className="text-foreground-dim text-[11px] mt-2 italic max-w-[80%]">
                      {QUOTE}
                    </p>
                  </div>
                  <div className="shrink-0 w-12 h-12 rounded-full border border-foreground/30 flex items-center justify-center">
                    <Play size={14} strokeWidth={1.2} fill="currentColor" className="text-foreground translate-x-[1px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center space-y-2">
              <p className="label-upper text-foreground">{preview} · {VARIANTS.find(v => v.id === preview)?.label}</p>
              <p className="text-[12px] text-foreground-dim">
                실제 홈에 적용 시 모습입니다.<br />
                마음에 들면 대화창에 <span className="text-foreground">&quot;{preview}로 적용&quot;</span> 입력해주세요.
              </p>
              <button
                onClick={() => setPreview(null)}
                className="mt-3 px-5 py-2 rounded-full border border-foreground/30 text-foreground text-[12px]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {active && !preview && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 surface-paper rounded-full px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3">
          <p className="label-tag">선택: {active}</p>
          <p className="text-foreground text-[13px]">대화창에 &quot;{active}로 적용&quot; 입력</p>
        </div>
      )}
    </div>
  )
}
