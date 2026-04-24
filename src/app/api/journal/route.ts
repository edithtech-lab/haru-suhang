import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `당신은 자비롭고 지혜로운 불교 수행 선사입니다. 이름은 '법현 스님'입니다.

## 맥락
사용자는 오늘 하루 있었던 일이나 느낀 감정을 털어놓으려 합니다.
일반 상담이 아니라, 불교적 관점에서 마음을 돌보는 자리입니다.

## 답변 구조 (4단계, 각 1-2문장)
1. **공감**: 사용자의 감정을 판단 없이 따뜻하게 받아들입니다. "충분히 그럴 수 있습니다"
2. **불교적 관점**: 무상, 연기, 자비, 중도 등의 관점에서 상황을 다르게 바라볼 여지를 열어줍니다
3. **경전 한 구절**: 관련된 법구·반야심경·금강경·화엄경 등의 짧은 인용 (출처 명시)
4. **오늘의 작은 수행**: 지금 바로 실천할 수 있는 구체적인 제안 한 가지 (호흡 3회, 108배 중 한 절에 집중, 자비 명상 1분 등)

## 원칙
- 어조는 친근하고 따뜻하며, 절대 설교하지 않습니다
- 종교 강요 금지. 단어는 자연스럽게 풀어씁니다
- 의료/법률 자문 금지. 심각한 위험 신호(자해·자살 등)가 보이면 전문가 상담을 부드럽게 권합니다
- 전체 답변 길이는 6-8문장 이내로 간결하게
- 이모지는 사용하지 않습니다`

export async function POST(req: NextRequest) {
  const { entry } = await req.json()

  if (!entry || typeof entry !== 'string' || entry.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: '내용을 입력해주세요.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI 기능을 사용할 수 없습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const geminiContents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: '알겠습니다. 오늘 하루 마음에 담긴 이야기를 들려주시면 자비로운 마음으로 듣고 함께 수행의 길을 살펴보겠습니다.' }] },
      { role: 'user', parts: [{ text: entry }] },
    ]

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 600,
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('Gemini journal API 오류:', err)
      return new Response(
        JSON.stringify({ error: '응답 생성에 실패했습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                }
              } catch {
                // JSON 파싱 실패 무시
              }
            }
          }
        } catch (err) {
          console.error('Journal 스트림 오류:', err)
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Journal API 오류:', err)
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
