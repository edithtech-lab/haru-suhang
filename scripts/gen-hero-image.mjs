// Gemini Image API로 홈 히어로 합장 이미지 생성
// 실행: node scripts/gen-hero-image.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// ===== .env.local 파싱 (KEY=VALUE 형식) =====
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found')
    process.exit(1)
  }
  const content = fs.readFileSync(envPath, 'utf-8')
  const env = {}
  // 영숫자 + _ - 만 캡처해서 \r 등 잡스러운 문자 제거
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_]+)\s*=\s*"?([A-Za-z0-9_\-./:]*)"?/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

const env = loadEnv()
const KEY = env.GEMINI_API_KEY
if (!KEY) {
  console.error('❌ GEMINI_API_KEY not in .env.local')
  process.exit(1)
}
console.log(`🔑 Key loaded: length=${KEY.length}, prefix=${KEY.slice(0, 6)}..., suffix=...${KEY.slice(-4)}`)

// ===== 프롬프트 =====
const PROMPT = `Photograph: Two hands pressed together in anjali mudra (prayer position).
Fingertips pointing up, fingers gently aligned, palms touching.
No face visible — show only hands and partial wrist with dark sleeve.
Cinematic close-up framing, deep amber and copper warm rim light from the side.
Dark muted brown background with subtle warmth, shallow depth of field.
Visible film grain, dreamlike meditative atmosphere.
Korean buddhist aesthetic. No logo, no text, no watermark.
3:4 vertical aspect ratio portrait orientation.`

const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'hero')
const OUTPUT_NAME = 'anjali'

// ===== Gemini Image API 호출 =====
const MODEL = process.env.MODEL || 'gemini-2.5-flash-image' // or gemini-3-pro-image-preview
async function generate() {
  console.log(`📦 Model: ${MODEL}`)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`
  console.log('🎨 Calling Gemini Image API...')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('❌ API error:', res.status, text.slice(0, 800))
    process.exit(1)
  }

  const data = await res.json()
  const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
  if (!imagePart) {
    console.error('❌ No image in response:')
    console.error(JSON.stringify(data, null, 2).slice(0, 800))
    process.exit(1)
  }

  const mime = imagePart.inlineData.mimeType
  const ext = mime?.includes('png') ? 'png' : mime?.includes('jpeg') ? 'jpg' : 'png'
  const buffer = Buffer.from(imagePart.inlineData.data, 'base64')

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // 일단 raw 저장
  const rawPath = path.join(OUTPUT_DIR, `${OUTPUT_NAME}.${ext}`)
  fs.writeFileSync(rawPath, buffer)
  console.log(`✅ Saved raw: ${rawPath} (${(buffer.length / 1024).toFixed(0)} KB)`)

  // sharp 있으면 webp로도 저장
  try {
    const sharp = (await import('sharp')).default
    const webpPath = path.join(OUTPUT_DIR, `${OUTPUT_NAME}.webp`)
    await sharp(buffer)
      .resize(1080, 1440, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(webpPath)
    const webpSize = fs.statSync(webpPath).size
    console.log(`✅ Saved webp: ${webpPath} (${(webpSize / 1024).toFixed(0)} KB)`)
  } catch (e) {
    console.log('ℹ️  sharp 없음 — raw 파일만 저장됨. webp로 쓰려면 코드에서 .png/.jpg 경로로 변경하세요.')
  }
}

generate().catch(err => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
