'use client'

export interface AmbientSoundDef {
  id: string
  name: string
  emoji: string
  create: (ctx: AudioContext) => { node: AudioNode; stop: () => void }
}

function createWindSound(ctx: AudioContext) {
  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 400
  filter.Q.value = 0.5

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.15
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 150
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()

  const gain = ctx.createGain()
  gain.gain.value = 0.12

  source.connect(filter)
  filter.connect(gain)
  source.start()

  return { node: gain, stop: () => { source.stop(); lfo.stop() } }
}

function createRainSound(ctx: AudioContext) {
  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 1000

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 8000

  const gain = ctx.createGain()
  gain.gain.value = 0.08

  source.connect(hp)
  hp.connect(lp)
  lp.connect(gain)
  source.start()

  return { node: gain, stop: () => source.stop() }
}

function createStreamSound(ctx: AudioContext) {
  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 600
  bp.Q.value = 0.8

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.3
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 200
  lfo.connect(lfoGain)
  lfoGain.connect(bp.frequency)
  lfo.start()

  const gain = ctx.createGain()
  gain.gain.value = 0.1

  source.connect(bp)
  bp.connect(gain)
  source.start()

  return { node: gain, stop: () => { source.stop(); lfo.stop() } }
}

function createBirdSound(ctx: AudioContext) {
  const gain = ctx.createGain()
  gain.gain.value = 0.15

  let stopped = false
  const intervals: ReturnType<typeof setTimeout>[] = []

  function chirp() {
    if (stopped) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(2000 + Math.random() * 2000, now)
    osc.frequency.exponentialRampToValueAtTime(1500 + Math.random() * 1500, now + 0.1)
    g.gain.setValueAtTime(0.2, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    osc.connect(g)
    g.connect(gain)
    osc.start(now)
    osc.stop(now + 0.15)
  }

  function schedule() {
    if (stopped) return
    chirp()
    if (Math.random() > 0.5) {
      const t = setTimeout(chirp, 80 + Math.random() * 120)
      intervals.push(t)
    }
    const next = setTimeout(schedule, 1500 + Math.random() * 4000)
    intervals.push(next)
  }
  schedule()

  return { node: gain, stop: () => { stopped = true; intervals.forEach(clearTimeout) } }
}

function createBowlSound(ctx: AudioContext) {
  const gain = ctx.createGain()
  gain.gain.value = 0.2

  let stopped = false
  const intervals: ReturnType<typeof setTimeout>[] = []

  function ring() {
    if (stopped) return
    const now = ctx.currentTime
    const freq = 300 + Math.random() * 200
    const partials = [freq, freq * 1.5, freq * 2.8]

    partials.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now)
      g.gain.setValueAtTime(0.15 / (i + 1), now)
      g.gain.exponentialRampToValueAtTime(0.001, now + 4 + Math.random() * 2)
      osc.connect(g)
      g.connect(gain)
      osc.start(now)
      osc.stop(now + 6)
    })
  }

  function schedule() {
    if (stopped) return
    ring()
    const next = setTimeout(schedule, 6000 + Math.random() * 8000)
    intervals.push(next)
  }
  schedule()

  return { node: gain, stop: () => { stopped = true; intervals.forEach(clearTimeout) } }
}

function createWindChimeSound(ctx: AudioContext) {
  const gain = ctx.createGain()
  gain.gain.value = 0.15

  let stopped = false
  const intervals: ReturnType<typeof setTimeout>[] = []
  const notes = [523, 587, 659, 784, 880, 988, 1047]

  function chime() {
    if (stopped) return
    const now = ctx.currentTime
    const freq = notes[Math.floor(Math.random() * notes.length)]
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    g.gain.setValueAtTime(0.12, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 2)
    osc.connect(g)
    g.connect(gain)
    osc.start(now)
    osc.stop(now + 2)
  }

  function schedule() {
    if (stopped) return
    chime()
    if (Math.random() > 0.6) {
      const t = setTimeout(chime, 200 + Math.random() * 400)
      intervals.push(t)
    }
    const next = setTimeout(schedule, 3000 + Math.random() * 5000)
    intervals.push(next)
  }
  schedule()

  return { node: gain, stop: () => { stopped = true; intervals.forEach(clearTimeout) } }
}

export const AMBIENT_SOUNDS: AmbientSoundDef[] = [
  { id: 'wind', name: '산바람', emoji: '🍃', create: createWindSound },
  { id: 'rain', name: '빗소리', emoji: '🌧', create: createRainSound },
  { id: 'stream', name: '계곡물', emoji: '💧', create: createStreamSound },
  { id: 'birds', name: '새소리', emoji: '🐦', create: createBirdSound },
  { id: 'bowl', name: '싱잉볼', emoji: '🔔', create: createBowlSound },
  { id: 'chime', name: '풍경', emoji: '🎐', create: createWindChimeSound },
]
