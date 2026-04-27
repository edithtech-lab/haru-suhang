'use client'

// Web Audio API 기반 사운드 생성기 (외부 파일 불필요, 무저작권)
class SoundGenerator {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    return this.ctx
  }

  // ===== 1. 목탁 (둔탁한 나무 타격, ~150ms) =====
  playMoktak() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const bufferSize = ctx.sampleRate * 0.08
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    const noiseBP = ctx.createBiquadFilter()
    noiseBP.type = 'bandpass'
    noiseBP.frequency.value = 1200
    noiseBP.Q.value = 1.5

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.7, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06)

    noise.connect(noiseBP)
    noiseBP.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(350, now)
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08)

    const toneGain = ctx.createGain()
    toneGain.gain.setValueAtTime(0.4, now)
    toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)

    const toneLP = ctx.createBiquadFilter()
    toneLP.type = 'lowpass'
    toneLP.frequency.value = 800

    osc.connect(toneLP)
    toneLP.connect(toneGain)
    toneGain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.15)

    const sub = ctx.createOscillator()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(150, now)
    sub.frequency.exponentialRampToValueAtTime(80, now + 0.05)

    const subGain = ctx.createGain()
    subGain.gain.setValueAtTime(0.3, now)
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.07)

    sub.connect(subGain)
    subGain.connect(ctx.destination)
    sub.start(now)
    sub.stop(now + 0.1)
  }

  // ===== 2. 우드 블록 (청명한 나무, ~120ms) =====
  playWoodBlock() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const bufferSize = ctx.sampleRate * 0.05
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    const noiseBP = ctx.createBiquadFilter()
    noiseBP.type = 'bandpass'
    noiseBP.frequency.value = 2200
    noiseBP.Q.value = 2.5

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.5, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)

    noise.connect(noiseBP)
    noiseBP.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)

    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(900, now)
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08)

    const toneGain = ctx.createGain()
    toneGain.gain.setValueAtTime(0.4, now)
    toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)

    osc.connect(toneGain)
    toneGain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.12)
  }

  // ===== 3. 청명한 작은 종 (Clear Bell, ~500ms) =====
  playClearBell(volume = 1) {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const partials = [
      { freq: 880, gain: 0.4 * volume, decay: 0.5 },
      { freq: 1760, gain: 0.18 * volume, decay: 0.4 },
      { freq: 2640, gain: 0.08 * volume, decay: 0.3 },
    ]
    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      g.gain.setValueAtTime(gain, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + decay)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + decay)
    })
  }

  // ===== 4. 차임 (높고 청명한 음, ~600ms) =====
  playChime() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const partials = [
      { freq: 1318, gain: 0.32, decay: 0.6 }, // E6
      { freq: 1976, gain: 0.16, decay: 0.5 }, // B6
      { freq: 2637, gain: 0.08, decay: 0.4 }, // E7
    ]
    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      g.gain.setValueAtTime(gain, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + decay)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + decay)
    })
  }

  // ===== 5. 싱잉볼 (짧은 ver, ~1s) =====
  playSingingBowl() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const partials = [
      { freq: 220, gain: 0.32, decay: 1.2 },
      { freq: 440, gain: 0.18, decay: 1.0 },
      { freq: 880, gain: 0.08, decay: 0.7 },
      { freq: 1320, gain: 0.04, decay: 0.5 },
    ]
    partials.forEach(({ freq, gain, decay }, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      // 약간의 맥놀이 흔들림
      if (i === 0) osc.frequency.setValueAtTime(freq * 1.001, now + 0.3)
      g.gain.setValueAtTime(gain, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + decay)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + decay)
    })
  }

  // ===== 6. 톡 (미니멀 클릭, ~50ms) =====
  playTok() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const bufferSize = ctx.sampleRate * 0.025
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    const noiseHP = ctx.createBiquadFilter()
    noiseHP.type = 'highpass'
    noiseHP.frequency.value = 2500

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.5, now)

    noise.connect(noiseHP)
    noiseHP.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1800, now)

    const toneGain = ctx.createGain()
    toneGain.gain.setValueAtTime(0.3, now)
    toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04)

    osc.connect(toneGain)
    toneGain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.05)
  }

  // ===== 7. 칼림바 (따뜻한 청명음, ~600ms) =====
  playKalimba() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const bufferSize = ctx.sampleRate * 0.012
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.18, now)
    noise.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)

    const partials = [
      { freq: 659, gain: 0.4, decay: 0.6 }, // E5
      { freq: 1318, gain: 0.18, decay: 0.45 },
      { freq: 1976, gain: 0.06, decay: 0.3 },
    ]
    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      g.gain.setValueAtTime(gain, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + decay)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + decay)
    })
  }

  // ===== 사찰 범종 (긴 울림, 종료/이벤트용) =====
  playBell(count = 1) {
    const ctx = this.getContext()

    for (let i = 0; i < count; i++) {
      const delay = i * 2.5
      const now = ctx.currentTime + delay

      const hitBuf = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate)
      const hitData = hitBuf.getChannelData(0)
      for (let j = 0; j < hitData.length; j++) {
        hitData[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / hitData.length, 2)
      }
      const hit = ctx.createBufferSource()
      hit.buffer = hitBuf
      const hitGain = ctx.createGain()
      hitGain.gain.setValueAtTime(0.2, now)
      hitGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
      const hitLP = ctx.createBiquadFilter()
      hitLP.type = 'lowpass'
      hitLP.frequency.value = 2000
      hit.connect(hitLP)
      hitLP.connect(hitGain)
      hitGain.connect(ctx.destination)
      hit.start(now)

      const f0 = 170
      const partials = [
        { freq: f0, gain: 0.35, decay: 4.0 },
        { freq: f0 * 2.2, gain: 0.15, decay: 3.0 },
        { freq: f0 * 3.1, gain: 0.08, decay: 2.0 },
        { freq: f0 * 0.5, gain: 0.2, decay: 5.0 },
      ]

      partials.forEach(({ freq, gain: g, decay }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)
        osc.frequency.setValueAtTime(freq * 1.002, now + 0.5)
        osc.frequency.setValueAtTime(freq * 0.999, now + 1.5)
        gain.gain.setValueAtTime(g, now)
        gain.gain.setValueAtTime(g * 0.7, now + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, now + decay)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + decay)
      })
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

// ===== 카운트 사운드 메뉴 (108배·염불 등에서 선택 가능) =====
export type CountSoundId =
  | 'moktak'
  | 'wood'
  | 'bell'
  | 'chime'
  | 'bowl'
  | 'tok'
  | 'kalimba'

export interface CountSoundDef {
  id: CountSoundId
  name: string
  description: string
}

export const COUNT_SOUNDS: CountSoundDef[] = [
  { id: 'moktak', name: '목탁', description: '둔탁한 나무 타격' },
  { id: 'wood', name: '우드 블록', description: '청명한 나무' },
  { id: 'bell', name: '청명 종', description: '작고 또렷한 종' },
  { id: 'chime', name: '차임', description: '높고 맑은 음' },
  { id: 'bowl', name: '싱잉볼', description: '깊고 긴 울림' },
  { id: 'tok', name: '톡', description: '미니멀한 클릭' },
  { id: 'kalimba', name: '칼림바', description: '따뜻한 청명음' },
]

export function playCountSound(id: CountSoundId) {
  const gen = getSoundGenerator()
  switch (id) {
    case 'moktak': gen.playMoktak(); break
    case 'wood': gen.playWoodBlock(); break
    case 'bell': gen.playClearBell(); break
    case 'chime': gen.playChime(); break
    case 'bowl': gen.playSingingBowl(); break
    case 'tok': gen.playTok(); break
    case 'kalimba': gen.playKalimba(); break
    default: gen.playMoktak()
  }
}
