// Google Cloud TTS 한국어 음색 비교 샘플 생성
// 15개 음색 큐레이션: Chirp3-HD 10 + Neural2 3 + Wavenet 5
// 결과: public/voice-samples/google/{voice-name}__{sample-id}.mp3
// 이미 있는 파일은 스킵 (비용·시간 절약)

import fs from 'node:fs/promises'
import path from 'node:path'

const envPath = path.resolve('.env.local')
const envText = await fs.readFile(envPath, 'utf8')
const apiKeyMatch = envText.match(/GOOGLE_CLOUD_TTS_API_KEY="?([A-Za-z0-9_\-]+)"?/)
if (!apiKeyMatch) {
  console.error('GOOGLE_CLOUD_TTS_API_KEY not found in .env.local')
  process.exit(1)
}
const apiKey = apiKeyMatch[1].trim()

const SAMPLES = [
  {
    id: 'intro',
    text: '지금부터 백팔배를 시작합니다. 마음을 모아 절을 올리세요.',
  },
  {
    id: 'count',
    text: '일배. 이배. 삼배. 십배. 오십사배. 백팔배.',
  },
  {
    id: 'end',
    text: '백팔배 회향합니다. 수고하셨습니다.',
  },
]

// 큐레이션 — 명상 톤 후보 15명
const VOICES = [
  // 남성 — Chirp3-HD (Google 2024 신모델, 가장 자연스러움)
  { name: 'ko-KR-Chirp3-HD-Charon', gender: '남성', tone: 'Chirp3 · 깊고 묵직' },
  { name: 'ko-KR-Chirp3-HD-Schedar', gender: '남성', tone: 'Chirp3 · 안정감' },
  { name: 'ko-KR-Chirp3-HD-Iapetus', gender: '남성', tone: 'Chirp3 · 차분함' },
  { name: 'ko-KR-Chirp3-HD-Orus', gender: '남성', tone: 'Chirp3 · 단단함' },
  { name: 'ko-KR-Chirp3-HD-Algenib', gender: '남성', tone: 'Chirp3 · 따뜻함' },
  { name: 'ko-KR-Chirp3-HD-Achird', gender: '남성', tone: 'Chirp3 · 부드러움' },
  { name: 'ko-KR-Chirp3-HD-Puck', gender: '남성', tone: 'Chirp3 · 명료함' },
  // 남성 — Neural2 / Wavenet (기존)
  { name: 'ko-KR-Neural2-C', gender: '남성', tone: 'Neural2 · 깊고 차분' },
  { name: 'ko-KR-Wavenet-C', gender: '남성', tone: 'Wavenet · 안정적' },
  { name: 'ko-KR-Wavenet-D', gender: '남성', tone: 'Wavenet · 따뜻함' },
  // 여성 — Chirp3-HD
  { name: 'ko-KR-Chirp3-HD-Aoede', gender: '여성', tone: 'Chirp3 · 맑고 따뜻' },
  { name: 'ko-KR-Chirp3-HD-Kore', gender: '여성', tone: 'Chirp3 · 차분' },
  { name: 'ko-KR-Chirp3-HD-Sulafat', gender: '여성', tone: 'Chirp3 · 부드러움' },
  // 여성 — Neural2 / Wavenet (기존)
  { name: 'ko-KR-Neural2-B', gender: '여성', tone: 'Neural2 · 자연스러움' },
  { name: 'ko-KR-Wavenet-B', gender: '여성', tone: 'Wavenet · 부드러움' },
]

const OUT_DIR = path.resolve('public/voice-samples/google')
await fs.mkdir(OUT_DIR, { recursive: true })

async function fileExists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function gen(voice, text, outPath) {
  if (await fileExists(outPath)) {
    return { ok: true, skipped: true }
  }
  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'ko-KR', name: voice },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0,
          },
        }),
      },
    )
    if (!res.ok) {
      const errText = await res.text()
      console.warn(`  FAIL HTTP ${res.status}: ${errText.slice(0, 200)}`)
      return { ok: false }
    }
    const data = await res.json()
    if (!data.audioContent) {
      console.warn('  ERR no audioContent')
      return { ok: false }
    }
    const buf = Buffer.from(data.audioContent, 'base64')
    await fs.writeFile(outPath, buf)
    return { ok: true, skipped: false }
  } catch (e) {
    console.warn(`  ERR ${e.message}`)
    return { ok: false }
  }
}

const manifest = {
  samples: SAMPLES,
  voices: [],
  generatedAt: new Date().toISOString(),
}
let newCount = 0
let skipCount = 0

for (const v of VOICES) {
  console.log(`\n[${v.name} :: ${v.gender} ${v.tone}]`)
  const okIds = []
  for (const s of SAMPLES) {
    const filename = `${v.name}__${s.id}.mp3`
    const outPath = path.join(OUT_DIR, filename)
    const r = await gen(v.name, s.text, outPath)
    if (r.ok) {
      okIds.push(s.id)
      if (r.skipped) {
        skipCount++
        console.log(`  SKIP ${filename}`)
      } else {
        newCount++
        console.log(`  OK   ${filename}`)
      }
    }
    if (!r.skipped) await new Promise(r => setTimeout(r, 200))
  }
  if (okIds.length === SAMPLES.length) {
    manifest.voices.push({
      name: v.name,
      gender: v.gender,
      tone: v.tone,
      samples: okIds,
    })
  }
}

await fs.writeFile(
  path.join(OUT_DIR, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
)
console.log(
  `\nDone. ${manifest.voices.length}/${VOICES.length} voices · new ${newCount}, skipped ${skipCount}`,
)
