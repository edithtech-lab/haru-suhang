'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'haru-splash-shown'
const DURATION = 2200 // ms

export function SplashScreen() {
  const [show, setShow] = useState(false)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    try {
      const shown = sessionStorage.getItem(STORAGE_KEY)
      if (!shown) {
        setShow(true)
        sessionStorage.setItem(STORAGE_KEY, '1')
        const t1 = setTimeout(() => setHiding(true), DURATION - 500)
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
      className={`fixed inset-0 z-[100] transition-opacity duration-500 ${hiding ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: '#000' }}
    >
      {/* 블러된 인물/사찰 이미지 자리 — 추후 /public/images/splash-hero.jpg 추가 시 Image로 교체 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 메인 배경 그라데이션 (이미지 대체) */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 40%, rgba(215, 106, 58, 0.55) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 30% 60%, rgba(100, 60, 40, 0.6) 0%, transparent 70%),
              radial-gradient(ellipse 70% 50% at 70% 30%, rgba(180, 80, 50, 0.4) 0%, transparent 65%),
              linear-gradient(180deg, #1a0e08 0%, #000 100%)
            `,
            filter: 'saturate(1.3)',
          }}
        />

        {/* 실루엣 레이어 (추상 인물 형태) */}
        <div className="absolute inset-0 opacity-70">
          <div
            className="absolute top-[30%] left-[25%] w-[50%] h-[40%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(20, 10, 5, 0.6) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          <div
            className="absolute top-[25%] left-[50%] w-[30%] h-[35%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(30, 15, 10, 0.55) 0%, transparent 70%)',
              filter: 'blur(25px)',
            }}
          />
          <div
            className="absolute top-[35%] left-[10%] w-[25%] h-[30%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(25, 12, 8, 0.5) 0%, transparent 70%)',
              filter: 'blur(28px)',
            }}
          />
        </div>

        {/* 하단 비네트 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, transparent 45%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        {/* 그레인 노이즈 (옵션 - 매우 미묘) */}
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 중앙 타이틀 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        <h1
          className="text-foreground text-[56px] tracking-[0.05em] font-light"
          style={{
            fontVariationSettings: '"wght" 300',
            letterSpacing: '0.1em',
            animation: 'splash-fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          하루 수행
        </h1>
        <p
          className="mt-4 text-foreground-dim text-[11px] tracking-[0.35em] uppercase"
          style={{ animation: 'splash-fade-in 1.2s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          Daily Practice
        </p>
      </div>

      <style>{`
        @keyframes splash-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
