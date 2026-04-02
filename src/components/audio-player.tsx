'use client'

// Web Audio API 기반 사운드 생성기 (외부 파일 불필요)
class SoundGenerator {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    return this.ctx
  }

  // 목탁 소리 (짧은 우드블록 느낌)
  playMoktak() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15)

    filter.type = 'bandpass'
    filter.frequency.value = 600
    filter.Q.value = 2

    gain.gain.setValueAtTime(0.5, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  }

  // 종소리 (사찰 종 느낌)
  playBell(count = 1) {
    const ctx = this.getContext()

    for (let i = 0; i < count; i++) {
      const delay = i * 1.5
      const now = ctx.currentTime + delay

      // 기본 톤
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(440, now)
      gain1.gain.setValueAtTime(0.4, now)
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 2.5)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 2.5)

      // 배음
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880, now)
      gain2.gain.setValueAtTime(0.15, now)
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 1.8)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now)
      osc2.stop(now + 1.8)

      // 저음 울림
      const osc3 = ctx.createOscillator()
      const gain3 = ctx.createGain()
      osc3.type = 'sine'
      osc3.frequency.setValueAtTime(220, now)
      gain3.gain.setValueAtTime(0.2, now)
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 3)
      osc3.connect(gain3)
      gain3.connect(ctx.destination)
      osc3.start(now)
      osc3.stop(now + 3)
    }
  }
}

let soundGen: SoundGenerator | null = null

export function getSoundGenerator(): SoundGenerator {
  if (!soundGen) {
    soundGen = new SoundGenerator()
  }
  return soundGen
}
