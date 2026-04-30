'use client'

// 수행자 종 — 인앱 알림 리스너
// layout에 한 번 마운트, 1분마다 현재 시간이 설정 시간과 일치하는지 체크
// 일치하면 싱잉볼 + 모달 (1일 1회/시각 — localStorage로 중복 방지)

import { useEffect, useState } from 'react'
import {
  getBellSettings,
  onBellSettingsChange,
  type MindfulBellSettings,
} from '@/lib/mindful-bell-store'
import { getSoundGenerator } from '@/components/audio-player'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const BREATH_MS = 8000 // 모달 자동 닫힘 (8초 호흡)

export function MindfulBellListener() {
  const [settings, setSettings] = useState<MindfulBellSettings>({
    enabled: false,
    times: [],
  })
  const [show, setShow] = useState(false)

  // 설정 로드
  useEffect(() => {
    setSettings(getBellSettings())
    return onBellSettingsChange(() => setSettings(getBellSettings()))
  }, [])

  // 분 단위 체크
  useEffect(() => {
    if (!settings.enabled || settings.times.length === 0) return

    const checkBell = () => {
      const now = new Date()
      const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`
      if (!settings.times.includes(hhmm)) return

      const dedupKey = `bell-fired-${todayStr()}-${hhmm}`
      if (typeof window !== 'undefined' && localStorage.getItem(dedupKey)) return
      try {
        localStorage.setItem(dedupKey, '1')
      } catch {
        // 무시
      }

      // 종소리 + 모달
      try {
        getSoundGenerator().playLongSingingBowl(0.5)
      } catch {
        // 오디오 컨텍스트 권한 등 — 무시
      }
      setShow(true)
    }

    checkBell()
    const interval = setInterval(checkBell, 60_000)
    return () => clearInterval(interval)
  }, [settings])

  // 자동 닫힘
  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setShow(false), BREATH_MS * 6)
    return () => clearTimeout(t)
  }, [show])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in"
      onClick={() => setShow(false)}
    >
      <div
        className="surface-paper border border-[var(--surface-border)] rounded-3xl px-8 py-10 mx-5 max-w-sm w-full text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* 호흡 원 */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full border border-accent/40"
            style={{
              animation: 'breath-pulse 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute inset-2 rounded-full bg-[var(--accent-glow)]"
            style={{
              animation: 'breath-pulse 8s ease-in-out infinite',
              animationDelay: '0.3s',
            }}
          />
        </div>

        <p className="label-upper text-accent mb-3">Mindful Moment</p>
        <p className="text-foreground text-[22px] tracking-tight font-medium mb-2">
          잠시 멈춤
        </p>
        <p className="text-foreground-dim text-[13px] leading-relaxed mb-6">
          깊이 들숨, 천천히 날숨.
          <br />
          지금 이 순간을 알아차려 보세요.
        </p>
        <button
          onClick={() => setShow(false)}
          className="px-6 py-2 rounded-full border border-[var(--surface-border)] text-[11px] uppercase tracking-[0.18em] text-foreground-dim hover:text-foreground transition-colors"
        >
          이어가기
        </button>
      </div>

      <style jsx>{`
        @keyframes breath-pulse {
          0%, 100% { transform: scale(0.85); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
