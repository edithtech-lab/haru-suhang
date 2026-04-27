'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'haru-splash-shown'
const DURATION = 2400 // ms

/**
 * 런치 스플래시 — Open 시작 화면 차용
 * - 인물 클로즈업 사진 풀스크린 (블러)
 * - 중앙에 큰 자간 타이포 ("하루  수행" 글자 사이 더블 스페이스)
 * - 세션당 1회 노출
 */
export function SplashScreen() {
  const [show, setShow] = useState(false)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    try {
      const shown = sessionStorage.getItem(STORAGE_KEY)
      if (!shown) {
        setShow(true)
        sessionStorage.setItem(STORAGE_KEY, '1')
        const t1 = setTimeout(() => setHiding(true), DURATION - 600)
        const t2 = setTimeout(() => setShow(false), DURATION)
        return () => {
          clearTimeout(t1)
          clearTimeout(t2)
        }
      }
    } catch {
      // sessionStorage 차단 시 스킵
    }
  }, [])

  if (!show) return null

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] transition-opacity duration-600 ${hiding ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: '#000' }}
    >
      {/* 인물 placeholder — 클로즈업 얼굴 느낌 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 메인: 인물 클로즈업 시뮬레이션 (이마/얼굴 톤) */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 65% 50% at 50% 35%, rgba(180, 130, 100, 0.45) 0%, rgba(80, 50, 40, 0.6) 35%, transparent 65%),
              radial-gradient(ellipse 90% 70% at 50% 100%, rgba(0, 0, 0, 0.85) 0%, transparent 70%),
              radial-gradient(ellipse 60% 50% at 50% 0%, rgba(220, 160, 110, 0.2) 0%, transparent 60%),
              linear-gradient(180deg, #1a0f08 0%, #050302 60%, #000 100%)
            `,
          }}
        />

        {/* 옆 측면 light spill (얼굴 광택) */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 30% 40% at 78% 30%, rgba(232, 168, 110, 0.25) 0%, transparent 55%),
              radial-gradient(ellipse 25% 30% at 22% 25%, rgba(180, 110, 70, 0.2) 0%, transparent 55%)
            `,
            filter: 'blur(2px)',
          }}
        />

        {/* 입체감을 위한 어두운 광 (코·턱 그림자 시뮬) */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 12% 25% at 50% 55%, rgba(0, 0, 0, 0.5) 0%, transparent 70%),
              radial-gradient(ellipse 18% 12% at 50% 70%, rgba(0, 0, 0, 0.4) 0%, transparent 70%)
            `,
            filter: 'blur(8px)',
          }}
        />

        {/* 강한 블러 처리 (인물이 흐릿하게) */}
        <div
          className="absolute inset-0 backdrop-blur-2xl"
          style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
        />

        {/* 비네트 (가장자리 어둡게) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)',
          }}
        />

        {/* 그레인 노이즈 (필름 질감) */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 중앙 타이틀 — 자간 극단적 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        <h1
          className="text-foreground text-[44px] font-light"
          style={{
            letterSpacing: '0.5em',
            fontVariationSettings: '"wght" 280',
            paddingLeft: '0.5em', // letter-spacing 보정
            animation: 'splash-fade-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          하루 수행
        </h1>
        <p
          className="mt-5 text-foreground-dim text-[10px] tracking-[0.4em] uppercase"
          style={{ animation: 'splash-fade-in 1.4s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          Daily Practice
        </p>
      </div>

      <style>{`
        @keyframes splash-fade-in {
          from { opacity: 0; transform: translateY(10px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </div>
  )
}
