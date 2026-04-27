import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text, source } = await req.json()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { commentary: '법어 해설은 이 가르침의 핵심을 일상에 적용하는 것입니다. 잠시 멈추어 이 말씀의 의미를 되새겨 보세요.' },
      { status: 200 }
    )
  }

  try {
    const prompt = `당신은 자비로운 불교 법사입니다. 다음 법어/경전 구절을 현대인이 이해하기 쉽게, 일상에 적용할 수 있도록 따뜻하고 지혜롭게 해설해주세요.

## 답변 구조 (5-7문장)
1. 의미 풀이: 이 구절이 담은 핵심 가르침을 쉬운 말로
2. 불교적 맥락: 어떤 교리(무상·연기·자비·중도 등)와 연결되는지
3. 일상 적용: 지금의 삶에 어떻게 적용할 수 있는지 구체적으로
4. 마무리 권유: 한 문장으로 마음에 새기고 싶은 핵심

## 어조
- 따뜻하고 다정. 절대 설교하지 않습니다.
- 한국어. 자연스러운 구어체.
- 1-2문장으로 짧게 끝내지 말고 5-7문장으로 충분히 풀어주세요.

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
