// 108배 음성 가이드 플레이어
// 4명 인도자(현묵·정안·혜오·자은) × 108 카운트 + 안내 음성 통합 재생
// 죽비/마디 종/회향 종(싱잉볼)은 audio-player.tsx의 SoundGenerator 재활용

import { getSoundGenerator } from '@/components/audio-player'

export interface BowVoice {
  id: string
  label: string
}

export const BOW_VOICES: BowVoice[] = [
  { id: 'hyeonmuk', label: '현묵' },
  { id: 'jeongan', label: '정안' },
  { id: 'hyeoo', label: '혜오' },
  { id: 'jaeun', label: '자은' },
]

export interface BowGuidedOptions {
  voiceId: string
  speedSec: number       // 한 배당 시간 (초)
  jukbi: boolean         // 죽비 사운드 (매 카운트)
  milestoneBell: boolean // 27/54/81배 종소리
  onCount?: (n: number) => void
  onComplete?: () => void
  onStateChange?: (status: BowStatus) => void
}

export type BowStatus = 'idle' | 'intro' | 'playing' | 'paused' | 'completing'

const BOW_TARGET = 108
const MILESTONES = [27, 54, 81]

function pad3(n: number) {
  return String(n).padStart(3, '0')
}

export class BowGuidedPlayer {
  private opts: BowGuidedOptions
  private currentBow = 0
  private status: BowStatus = 'idle'
  private timer: ReturnType<typeof setTimeout> | null = null
  private audioPool = new Map<string, HTMLAudioElement>()
  private currentlyPlaying = new Set<HTMLAudioElement>()
  private wakeLock: WakeLockSentinel | null = null

  constructor(opts: BowGuidedOptions) {
    this.opts = opts
    this.preload(opts.voiceId)
  }

  // 음성 mp3 미리 로드 (intro·half·end + 108 카운트)
  private preload(voiceId: string) {
    const ids: string[] = ['intro', 'half', 'end']
    for (let n = 1; n <= BOW_TARGET; n++) ids.push(`count-${pad3(n)}`)

    for (const id of ids) {
      const audio = new Audio(`/sounds/bows/${voiceId}/${id}.mp3`)
      audio.preload = 'auto'
      this.audioPool.set(id, audio)
    }
  }

  // 인도자 변경 (재시작 없이도 가능)
  changeVoice(voiceId: string) {
    this.audioPool.forEach(a => {
      a.pause()
      a.src = ''
    })
    this.audioPool.clear()
    this.opts.voiceId = voiceId
    this.preload(voiceId)
  }

  setSpeed(sec: number) {
    this.opts.speedSec = Math.max(2, Math.min(20, sec))
  }

  setJukbi(on: boolean) {
    this.opts.jukbi = on
  }

  setMilestoneBell(on: boolean) {
    this.opts.milestoneBell = on
  }

  getState() {
    return { status: this.status, count: this.currentBow }
  }

  // 시작 — intro 음성이 끝난 뒤 1.5초 대기 후 첫 카운트
  async start() {
    if (this.status !== 'idle' && this.status !== 'paused') return
    await this.acquireWakeLock()
    this.currentBow = 0
    this.setStatus('intro')

    const intro = this.audioPool.get('intro')
    if (intro) {
      // 안전 fallback — intro 음성이 어떤 이유로든 ended 이벤트를 못 쏘면 8초 후 강제 시작
      this.timer = setTimeout(() => {
        if ((this.status as BowStatus) === 'intro') {
          this.setStatus('playing')
          this.tick()
        }
      }, 8000)

      this.playClone(intro, () => {
        // intro 끝남 → 1.5초 정적 후 첫 카운트
        if (this.timer) clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          if ((this.status as BowStatus) === 'intro') {
            this.setStatus('playing')
            this.tick()
          }
        }, 1500)
      })
    } else {
      this.setStatus('playing')
      this.tick()
    }
  }

  pause() {
    if (this.status !== 'playing') return
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.setStatus('paused')
  }

  resume() {
    if (this.status !== 'paused') return
    this.setStatus('playing')
    this.scheduleNextTick()
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.currentlyPlaying.forEach(a => {
      a.pause()
      a.currentTime = 0
    })
    this.currentlyPlaying.clear()
    this.currentBow = 0
    this.setStatus('idle')
    this.releaseWakeLock()
  }

  // 정리 — 컴포넌트 언마운트 시
  dispose() {
    this.stop()
    this.audioPool.forEach(a => {
      a.src = ''
    })
    this.audioPool.clear()
  }

  // 한 배 진행 (음성·죽비·마디종 트리거)
  private tick() {
    if (this.status !== 'playing') return

    this.currentBow += 1
    const n = this.currentBow

    // 카운트 음성
    const countAudio = this.audioPool.get(`count-${pad3(n)}`)
    if (countAudio) this.playClone(countAudio)

    // 죽비 (살짝 늦게 — 음성과 겹쳐도 무방)
    if (this.opts.jukbi) {
      try {
        getSoundGenerator().playTok()
      } catch {
        // 사운드 생성 실패는 무시
      }
    }

    this.opts.onCount?.(n)

    // 마디 종 — 27, 54, 81배 (음성 끝난 뒤)
    if (this.opts.milestoneBell && MILESTONES.includes(n)) {
      setTimeout(() => {
        try {
          getSoundGenerator().playClearBell(0.7)
        } catch {
          // 무시
        }
      }, 1200)
    }

    // 절반 안내 — 54배 (마디 종 후)
    if (n === 54) {
      setTimeout(() => {
        const half = this.audioPool.get('half')
        if (half) this.playClone(half)
      }, 2400)
    }

    // 완료
    if (n >= BOW_TARGET) {
      this.setStatus('completing')
      setTimeout(() => {
        const end = this.audioPool.get('end')
        if (end) this.playClone(end)
      }, 1200)
      // 회향 — 긴 싱잉볼
      setTimeout(() => {
        try {
          getSoundGenerator().playLongSingingBowl(1)
        } catch {
          // 무시
        }
      }, 4500)
      // 완료 콜백 (UI 마무리 화면 표시)
      setTimeout(() => {
        this.setStatus('idle')
        this.releaseWakeLock()
        this.opts.onComplete?.()
      }, 6000)
      return
    }

    this.scheduleNextTick()
  }

  private scheduleNextTick() {
    if (this.status !== 'playing') return
    this.timer = setTimeout(() => this.tick(), this.opts.speedSec * 1000)
  }

  // 같은 audio element 동시 재생 회피 — 클론해서 재생
  // onEnded는 음성이 끝나거나 재생 실패 시 한 번만 호출 (호출자가 다음 단계 트리거 가능)
  private playClone(template: HTMLAudioElement, onEnded?: () => void) {
    try {
      const clone = template.cloneNode(true) as HTMLAudioElement
      clone.volume = 1
      this.currentlyPlaying.add(clone)
      clone.addEventListener('ended', () => {
        this.currentlyPlaying.delete(clone)
        onEnded?.()
      }, { once: true })
      clone.addEventListener('error', () => {
        this.currentlyPlaying.delete(clone)
        onEnded?.()
      }, { once: true })
      const p = clone.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          this.currentlyPlaying.delete(clone)
          onEnded?.()
        })
      }
    } catch {
      onEnded?.()
    }
  }

  private setStatus(s: BowStatus) {
    this.status = s
    this.opts.onStateChange?.(s)
  }

  // 화면 켜둠 (108배 7~14분 동안 잠금 방지)
  private async acquireWakeLock() {
    try {
      type Nav = Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> } }
      const nav = navigator as Nav
      if (nav.wakeLock) {
        this.wakeLock = await nav.wakeLock.request('screen')
      }
    } catch {
      // wake lock 미지원 — 무시
    }
  }

  private releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {})
      this.wakeLock = null
    }
  }
}
