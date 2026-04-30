import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limit: 분당 20회 (구절 해설은 자주 호출 가능)
  const rl = rateLimit(req, { prefix: 'wisdom', limit: 20, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { commentary: '잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      },
    )
  }

  const { text, source } = await req.json()

  // 입력 검증 (DoS / 비용 폭주 방지)
  if (typeof text !== 'string' || text.length === 0 || text.length > 1000) {
    return NextResponse.json(
      { commentary: '잘못된 입력입니다.' },
      { status: 400 }
    )
  }
  if (source && (typeof source !== 'string' || source.length > 100)) {
    return NextResponse.json(
      { commentary: '잘못된 입력입니다.' },
      { status: 400 }
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { commentary: '법어 해설은 이 가르침의 핵심을 일상에 적용하는 것입니다. 잠시 멈추어 이 말씀의 의미를 되새겨 보세요.' },
      { status: 200 }
    )
  }

  try {
    const prompt = `당신은 자비로운 불교 법사입니다. 다음 법어/경전 구절을 현대인이 이해하기 쉽게, 일상에 적용할 수 있도록 따뜻하고 지혜롭게 해설해주세요.

## 답변 형식 (★ 매우 중요 — 정확히 4개 단락, 단락 사이는 빈 줄로 구분)

[단락 1] 의미 풀이 (2-3문장): 이 구절이 담은 핵심 가르침을 쉬운 말로

[단락 2] 불교적 맥락 (2-3문장): 어떤 교리(무상·연기·자비·중도 등)와 연결되는지

[단락 3] 일상 적용 (2-3문장): 지금의 삶에 어떻게 적용할 수 있는지 구체적으로

[단락 4] 마음에 새기는 한 줄 (1문장): 짧고 명료한 한 줄로 마무리. "오늘 하루는...", "기억하세요...", "잠시 멈추고..." 같이 직접 권유하는 톤.

## 출력 규칙 (★ 필수)
- 단락은 정확히 4개
- 각 단락 사이에는 빈 줄(\\n\\n) 하나만 넣기
- "[단락 1]" 같은 라벨이나 번호는 붙이지 말 것 (라벨 없이 순수 본문만)
- 마크다운 형식 사용 X (별표·하이픈·헤더 모두 X)
- 따옴표 쓰지 말 것
- 자연스러운 한국어 구어체

법어: "${text}"
출처: ${source}

해설:`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 1500,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    )

    const data = await res.json()
    const commentary = data.candidates?.[0]?.content?.parts?.[0]?.text || '해설을 생성할 수 없습니다.'

    return NextResponse.json({ commentary })
  } catch {
    return NextResponse.json(
      { commentary: '해설을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
