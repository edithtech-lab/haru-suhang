// 108배 음성 가이드 풀세트 생성
// 4명 인도자(현묵·정안·혜오·자은) × (108 카운트 + 3 안내) = 444개 mp3
// 결과: public/sounds/bows/{voice}/{file}.mp3

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

// 한국어 한자 숫자 발음 (1~108)
function bowText(n) {
  const ones = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']
  const tens = ['', '십', '이십', '삼십', '사십', '오십', '육십', '칠십', '팔십', '구십']
  let num = ''
  if (n === 100) num = '백'
  else if (n > 100) {
    const rest = n - 100
    if (rest === 0) num = '백'
    else if (rest < 10) num = '백' + ones[rest]
    else num = '백' + tens[Math.floor(rest / 10)] + ones[rest % 10]
  } else if (n === 10) num = '십'
  else if (n < 10) num = ones[n]
  else num = tens[Math.floor(n / 10)] + ones[n % 10]
  return num + '배'
}

// 인도자 ↔ OpenAI 음색 매핑
const VOICES = [
  { id: 'hyeonmuk', label: '현묵', model: 'tts-1-hd', voice: 'onyx' },
  { id: 'jeongan', label: '정안', model: 'gpt-4o-mini-tts', voice: 'ash' },
  { id: 'hyeoo', label: '혜오', model: 'gpt-4o-mini-tts', voice: 'sage' },
  { id: 'jaeun', label: '자은', model: 'tts-1-hd', voice: 'shimmer' },
]

// 안내 음성
const NARRATIONS = [
  {
    id: 'intro',
    text: '지금부터 백팔배를 시작합니다. 마음을 모아 절을 올리세요.',
  },
  { id: 'half', text: '절반입니다. 호흡을 가다듬으세요.' },
  { id: 'end', text: '백팔배 회향합니다. 수고하셨습니다.' },
]

const OUT_BASE = path.resolve('public/sounds/bows')

async function gen(model, voice, text, outPath) {
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
      console.warn(`  FAIL ${path.basename(outPath)}: HTTP ${res.status} ${errText.slice(0, 100)}`)
      return false
    }
    const buf = Buffer.from(await res.arrayBuffer())
    await fs.writeFile(outPath, buf)
    return true
  } catch (e) {
    console.warn(`  ERR ${path.basename(outPath)}: ${e.message}`)
    return false
  }
}

const manifest = { voices: [], generatedAt: new Date().toISOString() }

for (const v of VOICES) {
  const dir = path.join(OUT_BASE, v.id)
  await fs.mkdir(dir, { recursive: true })
  console.log(`\n[${v.label} (${v.id}) :: ${v.model} / ${v.voice}]`)

  let okCount = 0
  let totalCount = 0

  // 카운트 001~108
  for (let n = 1; n <= 108; n++) {
    const text = bowText(n)
    const filename = `count-${String(n).padStart(3, '0')}.mp3`
    const outPath = path.join(dir, filename)
    totalCount++
    const ok = await gen(v.model, v.voice, text, outPath)
    if (ok) okCount++
    if (n % 18 === 0) console.log(`  ...${n}/108 (${text})`)
    await new Promise(r => setTimeout(r, 150))
  }

  // 안내 음성
  for (const nar of NARRATIONS) {
    const filename = `${nar.id}.mp3`
    const outPath = path.join(dir, filename)
    totalCount++
    const ok = await gen(v.model, v.voice, nar.text, outPath)
    if (ok) okCount++
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`  Done: ${okCount}/${totalCount}`)
  manifest.voices.push({
    id: v.id,
    label: v.label,
    model: v.model,
    openaiVoice: v.voice,
    files: { counts: 108, intro: 'intro.mp3', half: 'half.mp3', end: 'end.mp3' },
  })
}

await fs.writeFile(
  path.join(OUT_BASE, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
)
console.log('\nAll done. Manifest written to public/sounds/bows/manifest.json')
