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

  // 목탁 소리 (나무를 때리는 둔탁한 "똑" 소리)
  playMoktak() {
    const ctx = this.getContext()
    const now = ctx.currentTime

    // 1) 노이즈 버스트 (나무 타격 질감)
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

    // 2) 톤 (목탁 고유 공명 - 낮고 둥근 나무 울림)
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

    // 3) 서브 어택 (타격 무게감)
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

  // 종소리 (사찰 범종 느낌 - 깊고 긴 울림)
  playBell(count = 1) {
    const ctx = this.getContext()

    for (let i = 0; i < count; i++) {
      const delay = i * 2.5
      const now = ctx.currentTime + delay

      // 타격음 (종을 치는 순간)
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

      // 기본음 (범종 기본 주파수)
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
        // 약간의 피치 흔들림 (맥놀이 효과)
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
