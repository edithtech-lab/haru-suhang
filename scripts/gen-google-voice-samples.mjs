// Google Cloud TTS 한국어 음색 비교 샘플 생성
// Neural2 3개 + Wavenet 4개 = 7개 음색 × 3샘플(intro/count/end) = 21 mp3
// 결과: public/voice-samples/google/{voice-name}__{sample-id}.mp3

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

// 비교 샘플 텍스트 — 시작·카운트·회향 모두 들어가게
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

// 한국어 음색 후보 (Neural2 + Wavenet)
const VOICES = [
  { name: 'ko-KR-Neural2-A', gender: '여성', tone: 'Neural2 · 밝고 부드러움' },
  { name: 'ko-KR-Neural2-B', gender: '남성', tone: 'Neural2 · 깊고 차분' },
  { name: 'ko-KR-Neural2-C', gender: '여성', tone: 'Neural2 · 따뜻하고 명료' },
  { name: 'ko-KR-Wavenet-A', gender: '여성', tone: 'Wavenet · 자연스러움' },
  { name: 'ko-KR-Wavenet-B', gender: '여성', tone: 'Wavenet · 부드러움' },
  { name: 'ko-KR-Wavenet-C', gender: '남성', tone: 'Wavenet · 안정적' },
  { name: 'ko-KR-Wavenet-D', gender: '남성', tone: 'Wavenet · 따뜻함' },
]

const OUT_DIR = path.resolve('public/voice-samples/google')
await fs.mkdir(OUT_DIR, { recursive: true })

async function gen(voice, text, outPath) {
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
      console.warn(`  FAIL ${path.basename(outPath)}: HTTP ${res.status}`)
      console.warn(`       ${errText.slice(0, 200)}`)
      return false
    }
    const data = await res.json()
    if (!data.audioContent) {
      console.warn(`  ERR ${path.basename(outPath)}: no audioContent`)
      return false
    }
    const buf = Buffer.from(data.audioContent, 'base64')
    await fs.writeFile(outPath, buf)
    return true
  } catch (e) {
    console.warn(`  ERR ${path.basename(outPath)}: ${e.message}`)
    return false
  }
}

const manifest = { samples: SAMPLES, voices: [], generatedAt: new Date().toISOString() }
for (const v of VOICES) {
  console.log(`\n[${v.name} :: ${v.gender} ${v.tone}]`)
  const okIds = []
  for (const s of SAMPLES) {
    const filename = `${v.name}__${s.id}.mp3`
    const outPath = path.join(OUT_DIR, filename)
    const ok = await gen(v.name, s.text, outPath)
    if (ok) {
      okIds.push(s.id)
      console.log(`  OK   ${filename}`)
    }
    await new Promise(r => setTimeout(r, 200))
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
console.log(`\nDone. ${manifest.voices.length}/${VOICES.length} voice(s) succeeded.`)
