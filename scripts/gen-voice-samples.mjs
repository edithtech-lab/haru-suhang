// OpenAI TTS 음색 비교 샘플 생성
// tts-1-hd 6음색 + gpt-4o-mini-tts 추가 음색을 같은 문장으로 생성
// 결과: public/voice-samples/{model}-{voice}-{idx}.mp3

import fs from 'node:fs/promises'
import path from 'node:path'

// .env.local 로드
const envPath = path.resolve('.env.local')
const envText = await fs.readFile(envPath, 'utf8')
const apiKeyMatch = envText.match(/OPENAI_API_KEY="?([A-Za-z0-9_\-./:]+)"?/)
if (!apiKeyMatch) {
  console.error('OPENAI_API_KEY not found in .env.local')
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
    text: '일배. 이배. 삼배. 오배. 십배. 백팔배.',
  },
  {
    id: 'end',
    text: '백팔배 회향합니다. 수고하셨습니다.',
  },
]

// 검증할 음색 목록
const VOICE_TESTS = [
  // tts-1-hd 표준 6음색
  { model: 'tts-1-hd', voice: 'alloy' },
  { model: 'tts-1-hd', voice: 'echo' },
  { model: 'tts-1-hd', voice: 'fable' },
  { model: 'tts-1-hd', voice: 'onyx' },
  { model: 'tts-1-hd', voice: 'nova' },
  { model: 'tts-1-hd', voice: 'shimmer' },
  // gpt-4o-mini-tts 신규 음색 (있으면)
  { model: 'gpt-4o-mini-tts', voice: 'ash' },
  { model: 'gpt-4o-mini-tts', voice: 'ballad' },
  { model: 'gpt-4o-mini-tts', voice: 'coral' },
  { model: 'gpt-4o-mini-tts', voice: 'sage' },
  { model: 'gpt-4o-mini-tts', voice: 'verse' },
]

const OUT_DIR = path.resolve('public/voice-samples')
await fs.mkdir(OUT_DIR, { recursive: true })

async function gen(model, voice, sampleId, text) {
  const filename = `${model}__${voice}__${sampleId}.mp3`
  const outPath = path.join(OUT_DIR, filename)
  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        voice,
        input: text,
        response_format: 'mp3',
        speed: 1.0,
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      console.warn(`  SKIP ${filename}: HTTP ${res.status} ${errText.slice(0, 120)}`)
      return false
    }
    const buf = Buffer.from(await res.arrayBuffer())
    await fs.writeFile(outPath, buf)
    console.log(`  OK   ${filename}  (${(buf.length / 1024).toFixed(1)} KB)`)
    return true
  } catch (e) {
    console.warn(`  ERR  ${filename}: ${e.message}`)
    return false
  }
}

const manifest = []
for (const { model, voice } of VOICE_TESTS) {
  console.log(`\n[${model} :: ${voice}]`)
  const results = []
  for (const s of SAMPLES) {
    const ok = await gen(model, voice, s.id, s.text)
    if (ok) results.push(s.id)
    await new Promise(r => setTimeout(r, 250))
  }
  if (results.length === SAMPLES.length) {
    manifest.push({ model, voice, samples: results })
  }
}

await fs.writeFile(
  path.join(OUT_DIR, 'manifest.json'),
  JSON.stringify({ samples: SAMPLES, voices: manifest }, null, 2),
)
console.log(`\nDone. ${manifest.length} voice(s) succeeded. Manifest written.`)
