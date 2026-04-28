// 홈 히어로 합장 시안 10장 생성
// 실행: node scripts/gen-hero-photos.mjs
//   특정 변주만: node scripts/gen-hero-photos.mjs v05 v07
//   모델 변경: $env:MODEL="gemini-3-pro-image-preview"; node scripts/gen-hero-photos.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found')
    process.exit(1)
  }
  const content = fs.readFileSync(envPath, 'utf-8')
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

// ===== 10가지 합장 시안 =====
const VARIANTS = [
  {
    id: 'v01',
    label: '정면 합장',
    prompt: `Photograph: Two hands pressed together in anjali mudra (prayer position), fingertips pointing up.
Frontal close-up framing. Deep amber and copper warm side lighting from the right.
Dark muted brown background. Subject wearing dark monk-like sleeves, no face visible.
Cinematic, shallow depth of field, visible film grain.
Korean buddhist aesthetic. No logo, no text. 3:4 vertical portrait.`,
  },
  {
    id: 'v02',
    label: '탑다운 (위에서 아래)',
    prompt: `Photograph: Top-down view of two hands pressed together in anjali mudra prayer pose,
hands resting on a worn wooden temple surface, warm amber light pouring down from above.
Dark wooden floor visible around. No face. Intimate, contemplative mood.
Visible film grain. Korean buddhist aesthetic. No logo, no text. 3:4 vertical.`,
  },
  {
    id: 'v03',
    label: '옆 실루엣',
    prompt: `Photograph: Side profile view of two hands in anjali mudra prayer pose, silhouette of arms,
soft warm amber backlight glowing through fingers, dark muted brown background.
No face visible. Cinematic, dreamlike, visible film grain.
Korean buddhist aesthetic. No logo, no text. 3:4 vertical.`,
  },
  {
    id: 'v04',
    label: '손가락 끝 매크로',
    prompt: `Photograph: Extreme macro close-up of fingertips touching in anjali mudra,
only fingertips and partial palms fill the frame, very shallow depth of field.
Soft warm side lighting, dark background. Skin texture visible.
Dreamlike intimate. Visible film grain. No face. No text. 3:4 vertical.`,
  },
  {
    id: 'v05',
    label: '염주 함께',
    prompt: `Photograph: Two hands in anjali mudra prayer pose with wooden mala prayer beads
draped between fingers, the beads catching warm amber light.
Cinematic close-up, dark monastic background, deep shadows.
No face visible. Visible film grain. Korean buddhist aesthetic. No text. 3:4 vertical.`,
  },
  {
    id: 'v06',
    label: '새벽 푸른빛',
    prompt: `Photograph: Two hands pressed together in anjali mudra prayer position,
soft cool dawn light, pale blue and silver tones, misty foggy atmosphere.
Dark navy-blue background. Subject in dark clothing. No face visible.
Peaceful early morning serenity. Visible film grain. No logo, no text. 3:4 vertical.`,
  },
  {
    id: 'v07',
    label: '황혼 강한 적색',
    prompt: `Photograph: Two hands in anjali mudra prayer with strong warm red-orange rim lighting from sunset,
deep crimson and copper highlights on the edges of fingers, very dark background.
Dramatic cinematic shadows. No face visible. Visible film grain.
Korean buddhist aesthetic. No logo, no text. 3:4 vertical.`,
  },
  {
    id: 'v08',
    label: '한지 배경',
    prompt: `Photograph: Two hands in anjali mudra prayer pose, soft natural daylight,
hands rested gently against textured korean hanji paper background with subtle ink calligraphy strokes.
Warm sepia and cream tones. Traditional contemplative atmosphere. No face visible.
Visible film grain. No logo, no text. 3:4 vertical.`,
  },
  {
    id: 'v09',
    label: '향연 (인센스)',
    prompt: `Photograph: Two hands in anjali mudra prayer with curling wisps of incense smoke
rising in front of the hands, smoke catching warm amber light from the side.
Dark temple background, mystical contemplative atmosphere. No face visible.
Visible film grain. Korean buddhist aesthetic. No logo, no text. 3:4 vertical.`,
  },
  {
    id: 'v10',
    label: '달빛 합장',
    prompt: `Photograph: Two hands pressed together in anjali mudra prayer pose under soft silver moonlight,
cool blue-silver highlights with subtle warm amber undertone, deep indigo night sky as background.
Peaceful nocturnal atmosphere. No face visible. Visible film grain.
Korean buddhist aesthetic. No logo, no text. 3:4 vertical.`,
  },
]

const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'hero', 'lab')
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

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
  if (!part) throw new Error(`${v.id} no image in response`)
  const buffer = Buffer.from(part.inlineData.data, 'base64')

  // sharp로 webp 변환
  let saved
  try {
    const sharp = (await import('sharp')).default
    const webpPath = path.join(OUTPUT_DIR, `anjali-${v.id}.webp`)
    await sharp(buffer)
      .resize(1080, 1440, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(webpPath)
    saved = webpPath
  } catch {
    const fallbackPath = path.join(OUTPUT_DIR, `anjali-${v.id}.png`)
    fs.writeFileSync(fallbackPath, buffer)
    saved = fallbackPath
  }
  return { v, saved, size: fs.statSync(saved).size }
}

// ===== 메인 =====
const filter = process.argv.slice(2)
const targets = filter.length > 0 ? VARIANTS.filter(v => filter.includes(v.id)) : VARIANTS

console.log(`📦 Model: ${MODEL}`)
console.log(`🎨 Generating ${targets.length} variants...\n`)

// 병렬 생성 (5개씩 묶음)
const BATCH = 5
const results = []
for (let i = 0; i < targets.length; i += BATCH) {
  const batch = targets.slice(i, i + BATCH)
  const settled = await Promise.allSettled(batch.map(generate))
  settled.forEach((r, idx) => {
    if (r.status === 'fulfilled') {
      const { v, saved, size } = r.value
      console.log(`✅ ${v.id} ${v.label.padEnd(20)} (${(size / 1024).toFixed(0)} KB)`)
      results.push(r.value)
    } else {
      console.log(`❌ ${batch[idx].id} ${batch[idx].label}: ${r.reason.message}`)
    }
  })
  if (i + BATCH < targets.length) {
    console.log('   ...waiting 2s before next batch...')
    await new Promise(r => setTimeout(r, 2000))
  }
}

console.log(`\n🎉 Done. ${results.length}/${targets.length} saved to ${OUTPUT_DIR}`)
console.log(`👉 Visit /lab/hero-photos to compare.`)
