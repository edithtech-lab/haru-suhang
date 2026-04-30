// 수행자 종 (Mindful Bell) 설정 저장소
// Plum Village의 Bells of Mindfulness 영감 — 정해진 시간에 잠시 멈춤 알림
// localStorage 기반 (PWA 푸시 알림은 Phase 2)

'use client'

export interface MindfulBellSettings {
  enabled: boolean
  times: string[] // HH:MM 포맷, 예 ["09:00", "13:00", "18:00"]
}

const KEY = 'haru-mindful-bell'
const EVENT = 'haru-bell-settings-changed'

const DEFAULT_SETTINGS: MindfulBellSettings = {
  enabled: false,
  times: ['09:00', '13:00', '18:00'],
}

export function getBellSettings(): MindfulBellSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<MindfulBellSettings>
    return {
      enabled: !!parsed.enabled,
      times:
        Array.isArray(parsed.times) && parsed.times.length > 0
          ? parsed.times.slice(0, 5).filter(t => /^\d{2}:\d{2}$/.test(t))
          : DEFAULT_SETTINGS.times,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveBellSettings(s: MindfulBellSettings) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
    window.dispatchEvent(new CustomEvent(EVENT))
  } catch {
    // 무시
  }
}

export function onBellSettingsChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
