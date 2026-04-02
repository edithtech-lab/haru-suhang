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
    const prompt = `당신은 불교 법사입니다. 다음 법어를 현대인이 이해하기 쉽게, 일상에 적용할 수 있도록 따뜻하고 지혜롭게 해설해주세요. 3-4문장으로 간결하게 작성하세요.

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
            temperature: 0.7,
            maxOutputTokens: 300,
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
