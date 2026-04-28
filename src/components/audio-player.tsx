'use client'

// Web Audio API 기반 사운드 생성기 — 진짜 악기에 가깝게 정교화
// inharmonic partials (실제 종/싱잉볼 특성)
// 미세 detune으로 맥놀이(beat) 효과
// 부드러운 attack (linear ramp) + 자연스러운 release
class SoundGenerator {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        ((window as unknown) as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  // ===== 1. 목탁 — 둔탁한 나무 타격 (~150ms) =====
  playMoktak() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    // 노이즈 burst (나무 타격 질감)
    const bufSize = ctx.sampleRate * 0.08
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 3)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buf

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1200
    bp.Q.value = 1.5

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.7, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06)

    noise.connect(bp)
    bp.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)

    // 톤 (나무 공명)
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(350, now)
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 800

    const toneGain = ctx.createGain()
    toneGain.gain.setValueAtTime(0.4, now)
    toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)

    osc.connect(lp)
    lp.connect(toneGain)
    toneGain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.15)

    // 서브 어택
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

  // ===== 2. 우드 블록 — 청명한 나무 (~120ms) =====
  playWoodBlock() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const bufSize = ctx.sampleRate * 0.05
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buf

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2200
    bp.Q.value = 2.5

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.5, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)

    noise.connect(bp)
    bp.connect(noiseGain)
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

  // ===== 3. 청명한 작은 종 — inharmonic + 부드러운 attack (~700ms) =====
  playClearBell(volume = 1) {
    const ctx = this.getContext()
    const now = ctx.currentTime

    // 작은 종 inharmonic partials (벨/풍경)
    const fundamental = 880  // A5
    const partials = [
      { mult: 1.00, gain: 0.40 * volume, decay: 0.7 },
      { mult: 2.76, gain: 0.20 * volume, decay: 0.6 },  // inharmonic
      { mult: 5.40, gain: 0.10 * volume, decay: 0.5 },
      { mult: 8.93, gain: 0.05 * volume, decay: 0.4 },
    ]

    partials.forEach(({ mult, gain: g, decay }) => {
      const f = fundamental * mult
      // 메인
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(f, now)
      // 살짝 detune (맥놀이)
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(f * 1.003, now)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(g, now + 0.005)  // 5ms attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)
      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + decay)
      osc2.stop(now + decay)
    })
  }

  // ===== 4. 차임 — 풍경 (~800ms) =====
  playChime() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const fundamental = 1318  // E6
    const partials = [
      { mult: 1.00, gain: 0.32, decay: 0.8 },
      { mult: 1.50, gain: 0.18, decay: 0.7 },  // 5도
      { mult: 2.00, gain: 0.10, decay: 0.6 },  // 옥타브
      { mult: 3.34, gain: 0.05, decay: 0.5 },
    ]

    partials.forEach(({ mult, gain: g, decay }) => {
      const f = fundamental * mult
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(f, now)
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(f * 1.002, now)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(g, now + 0.003)
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)
      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + decay)
      osc2.stop(now + decay)
    })
  }

  // ===== 5. 싱잉볼 — 진짜 티벳 싱잉볼에 가깝게 (3초) =====
  // inharmonic partials + 맥놀이 + 부드러운 attack + 노이즈 mallet hit
  playSingingBowl() {
    this.singingBowlImpl(3.0, 1.0)
  }

  // ===== 5b. 긴 싱잉볼 — 명상 시작/종료용 (12초 sustain) =====
  playLongSingingBowl(volume = 1) {
    this.singingBowlImpl(12.0, volume)
  }

  private singingBowlImpl(durationBase: number, volume: number) {
    const ctx = this.getContext()
    const now = ctx.currentTime

    // 실제 티벳 싱잉볼 분석 기반 inharmonic partials
    // 기본음: A3 (220Hz) — 깊고 따뜻한 톤
    const fundamental = 220
    const partials = [
      { mult: 1.00, gain: 0.35, decay: durationBase * 1.0 },     // 기본음
      { mult: 2.32, gain: 0.22, decay: durationBase * 0.85 },    // 실제 inharmonic
      { mult: 4.05, gain: 0.14, decay: durationBase * 0.7 },
      { mult: 5.85, gain: 0.08, decay: durationBase * 0.55 },
      { mult: 7.81, gain: 0.04, decay: durationBase * 0.4 },
    ]

    partials.forEach(({ mult, gain: g, decay }, i) => {
      const f = fundamental * mult

      // 메인 oscillator
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(f, now)

      // 두 번째: 매우 살짝 detune → 맥놀이 (싱잉볼 특유의 흔들림)
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      // 0.3-0.5% 디튠 (1Hz 정도 차이로 1초마다 한 번 wobble)
      const detune = i === 0 ? 1.003 : 1.0025
      osc2.frequency.setValueAtTime(f * detune, now)

      // 시간 따라 미세하게 흔들림 (vibrato)
      const lfo = ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.setValueAtTime(0.4, now)  // 매우 느린 LFO
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = f * 0.0008  // 미세
      lfo.connect(lfoGain)
      lfoGain.connect(osc1.frequency)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      // 부드러운 attack (50ms)
      gain.gain.linearRampToValueAtTime(g * volume, now + 0.05)
      // 자연스러운 sustain → exponential decay
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)
      osc1.start(now)
      osc2.start(now)
      lfo.start(now)
      osc1.stop(now + decay)
      osc2.stop(now + decay)
      lfo.stop(now + decay)
    })

    // mallet hit (싱잉볼 가장자리 두드림 노이즈)
    const noiseSize = ctx.sampleRate * 0.08
    const noiseBuf = ctx.createBuffer(1, noiseSize, ctx.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < noiseSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseSize, 4)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuf

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 1500
    noiseFilter.Q.value = 1.5

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.18 * volume, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)
  }

  // ===== 6. 톡 — 미니멀 클릭 (~50ms) =====
  playTok() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const bufSize = ctx.sampleRate * 0.025
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.5)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buf

    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2500

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.5, now)

    noise.connect(hp)
    hp.connect(noiseGain)
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

  // ===== 7. 칼림바 — 따뜻한 청명음 inharmonic (~1s) =====
  playKalimba() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    // 키 어택 (얇은 노이즈 — 키 두드리는 소리)
    const noiseSize = ctx.sampleRate * 0.012
    const noiseBuf = ctx.createBuffer(1, noiseSize, ctx.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < noiseSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseSize, 2)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuf
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2000
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.18, now)
    noise.connect(hp)
    hp.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)

    // 톤 partials (칼림바 특유의 inharmonic)
    const fundamental = 659  // E5
    const partials = [
      { mult: 1.00, gain: 0.38, decay: 1.0 },
      { mult: 2.01, gain: 0.18, decay: 0.8 },
      { mult: 3.07, gain: 0.08, decay: 0.6 },
      { mult: 4.15, gain: 0.04, decay: 0.4 },
    ]

    partials.forEach(({ mult, gain: g, decay }) => {
      const f = fundamental * mult
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(f, now)
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(f * 1.002, now)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(g, now + 0.003)
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)
      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + decay)
      osc2.stop(now + decay)
    })
  }

  // ===== 사찰 범종 — 깊고 긴 울림 (명상 시작/종료) =====
  // 더 정교한 inharmonic + LFO 흔들림
  playBell(count = 1) {
    const ctx = this.getContext()

    for (let i = 0; i < count; i++) {
      const delay = i * 2.8
      const now = ctx.currentTime + delay

      // 타격음 (종을 치는 순간)
      const hitBuf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
      const hitData = hitBuf.getChannelData(0)
      for (let j = 0; j < hitData.length; j++) {
        hitData[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / hitData.length, 2)
      }
      const hit = ctx.createBufferSource()
      hit.buffer = hitBuf
      const hitGain = ctx.createGain()
      hitGain.gain.setValueAtTime(0.22, now)
      hitGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
      const hitLP = ctx.createBiquadFilter()
      hitLP.type = 'lowpass'
      hitLP.frequency.value = 2500
      hit.connect(hitLP)
      hitLP.connect(hitGain)
      hitGain.connect(ctx.destination)
      hit.start(now)

      // 사찰 범종 inharmonic partials (실제 한국 사찰 종 분석 기반)
      const f0 = 165  // 깊은 베이스
      const partials = [
        { mult: 0.50, gain: 0.18, decay: 6.0 },   // 옥타브 아래 (umbral)
        { mult: 1.00, gain: 0.32, decay: 5.0 },   // hum (기본음)
        { mult: 2.18, gain: 0.20, decay: 4.0 },   // prime (inharmonic)
        { mult: 2.98, gain: 0.12, decay: 3.5 },   // tierce
        { mult: 3.96, gain: 0.08, decay: 3.0 },   // quint
        { mult: 5.34, gain: 0.04, decay: 2.5 },   // nominal
      ]

      partials.forEach(({ mult, gain: g, decay }, idx) => {
        const f = f0 * mult
        const osc1 = ctx.createOscillator()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(f, now)

        const osc2 = ctx.createOscillator()
        osc2.type = 'sine'
        const detune = idx === 0 ? 1.004 : 1.002
        osc2.frequency.setValueAtTime(f * detune, now)

        // LFO 흔들림 (사찰 종 특유의 long wobble)
        const lfo = ctx.createOscillator()
        lfo.type = 'sine'
        lfo.frequency.setValueAtTime(0.3, now)
        const lfoGain = ctx.createGain()
        lfoGain.gain.value = f * 0.0006
        lfo.connect(lfoGain)
        lfoGain.connect(osc1.frequency)

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(g, now + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + decay)

        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(ctx.destination)
        osc1.start(now)
        osc2.start(now)
        lfo.start(now)
        osc1.stop(now + decay)
        osc2.stop(now + decay)
        lfo.stop(now + decay)
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

// ===== 카운트 사운드 메뉴 =====
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
