// 시리즈 W — 사용자 선호 4장(v01·v02·v04·v05) 특징 살린 변주 8장
// 가이드: docs/photo-style-guide.md 시그니처 톤 준수
// 실행: node scripts/gen-hero-series-w.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function loadEnv() {
  const content = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf-8')
  const env = {}
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_]+)\s*=\s*"?([A-Za-z0-9_\-./:]*)"?/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

const KEY = loadEnv().GEMINI_API_KEY
if (!KEY) {
  console.error('❌ GEMINI_API_KEY missing')
  process.exit(1)
}
const MODEL = process.env.MODEL || 'gemini-2.5-flash-image'

// ===== 시그니처 톤 (모든 프롬프트 공통) =====
const SIGNATURE = `deep amber and copper warm side rim lighting,
dark muted brown background (#1a0e08 to #2a1a10), 60-70% dark tones,
shallow depth of field with hands in sharp focus,
visible film grain, dreamlike meditative atmosphere,
korean buddhist aesthetic, anonymous (no face or only chin shadow),
no logo, no text, no watermark, 3:4 vertical portrait`

// ===== 8장 변주 =====
const VARIANTS = [
  // === 합장 정면 변주 (v01 패밀리) ===
  {
    id: 'w01',
    label: '합장 정면 — 가까이',
    category: '정면 합장',
    prompt: `Cinematic close-up frontal view of two hands pressed together in anjali mudra prayer position,
hands fill 60% of frame, fingertips pointing up, slight tilt 10 degrees.
Subject wearing dark monk-like sleeves.
${SIGNATURE}`,
  },
  {
    id: 'w02',
    label: '합장 정면 — 좌측 광원',
    category: '정면 합장',
    prompt: `Cinematic close-up of two hands pressed together in anjali mudra prayer,
fingertips up, frontal framing.
Light coming from the LEFT side (warm amber rim on left edge of fingers).
Subject wearing dark monk robes.
${SIGNATURE}`,
  },

  // === 탑다운 변주 (v02 패밀리) ===
  {
    id: 'w03',
    label: '탑다운 — 합장 + 한지',
    category: '탑다운',
    prompt: `Top-down view from above, looking down at two hands pressed together in anjali mudra,
hands centered, resting against textured korean hanji paper background with subtle ink calligraphy strokes.
Warm amber light pouring from one side, deep shadows.
${SIGNATURE}`,
  },
  {
    id: 'w04',
    label: '탑다운 — 빛줄기',
    category: '탑다운',
    prompt: `Top-down view of two hands in anjali mudra prayer pose on a dark wooden temple floor,
a single beam of warm amber light cutting diagonally across the hands and floor,
deep shadows everywhere else, dramatic chiaroscuro.
${SIGNATURE}`,
  },

  // === 매크로 변주 (v04 패밀리) ===
  {
    id: 'w05',
    label: '매크로 — 손가락 마디',
    category: '매크로',
    prompt: `Extreme macro close-up of finger knuckles and joints of hands in anjali mudra,
only knuckles and skin texture visible, very shallow focus on the second knuckle.
Warm side rim light highlighting skin texture.
${SIGNATURE}`,
  },
  {
    id: 'w06',
    label: '매크로 — 손바닥 + 빛',
    category: '매크로',
    prompt: `Extreme macro of an open empty palm catching warm amber light from the side,
fingers softly curled, deep shadows in palm creases.
Skin lines and texture extremely detailed.
${SIGNATURE}`,
  },

  // === 염주 변주 (v05 패밀리) ===
  {
    id: 'w07',
    label: '염주 — 합장 + 빛 받은 알',
    category: '염주',
    prompt: `Two hands in anjali mudra prayer with wooden mala prayer beads draped between palms,
one single bead catching a sharp warm amber highlight, others in shadow.
Cinematic close-up, dark background.
${SIGNATURE}`,
  },
  {
    id: 'w08',
    label: '염주 — 손가락이 알 굴림',
    category: '염주',
    prompt: `Extreme macro close-up of fingers gently rolling a single wooden mala bead between thumb and index,
the bead in sharp focus, hand and beads partially visible.
Warm amber side light, dark wooden background.
${SIGNATURE}`,
  },
]

const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'hero', 'lab')
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

async function generate(v) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: v.prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`${v.id} API ${res.status}: ${t.slice(0, 200)}`)
  }
  const data = await res.json()
  const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
  if (!part) throw new Error(`${v.id} no image`)
  const buffer = Buffer.from(part.inlineData.data, 'base64')

  const sharp = (await import('sharp')).default
  const webpPath = path.join(OUTPUT_DIR, `anjali-${v.id}.webp`)
  await sharp(buffer)
    .resize(1080, 1440, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(webpPath)
  return { v, path: webpPath, size: fs.statSync(webpPath).size }
}

const filter = process.argv.slice(2)
const targets = filter.length > 0 ? VARIANTS.filter(v => filter.includes(v.id)) : VARIANTS

console.log(`📦 Model: ${MODEL}`)
console.log(`🎨 Generating ${targets.length} W-series variants (signature tone)...\n`)

const BATCH = 4
const results = []
for (let i = 0; i < targets.length; i += BATCH) {
  const batch = targets.slice(i, i + BATCH)
  const settled = await Promise.allSettled(batch.map(generate))
  settled.forEach((r, idx) => {
    if (r.status === 'fulfilled') {
      const { v, size } = r.value
      console.log(`✅ ${v.id} ${v.category.padEnd(8)} ${v.label.padEnd(25)} (${(size / 1024).toFixed(0)} KB)`)
      results.push(r.value)
    } else {
      console.log(`❌ ${batch[idx].id}: ${r.reason.message}`)
    }
  })
  if (i + BATCH < targets.length) {
    console.log('   ...waiting 2s...')
    await new Promise(r => setTimeout(r, 2000))
  }
}

console.log(`\n🎉 ${results.length}/${targets.length} done.`)
console.log('👉 /lab/hero-photos 에서 비교하세요.')
