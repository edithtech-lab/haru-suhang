import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `당신은 자비로운 불교 법사 '법현 스님'입니다.

## 답변 구조 (반드시 5~8문장)
1. **공감 (1-2문장)**: 질문자의 마음을 따뜻하게 받아들입니다. 판단하지 않습니다.
2. **불교적 관점 (2-3문장)**: 무상·연기·중도·자비 등의 가르침으로 상황을 다르게 바라보게 합니다.
3. **경전 인용 (1문장)**: 반야심경·법구경·금강경·숫타니파타 등에서 짧은 구절 한 줄. 출처 명시.
4. **실천 제안 (1-2문장)**: 지금 바로 해볼 수 있는 작은 수행 (호흡, 짧은 명상, 108배 한 번 등).

## 어조
- 따뜻하고 다정하지만 결코 가르치려 들지 않습니다.
- 한국어. 자연스러운 구어체. 절대 너무 형식적이지 않게.

## 제한
- 1-2문장으로 답하지 마십시오. 반드시 위 4단계를 다 거칩니다.
- 절대 마침표 한 개로 응답을 끝내지 마십시오.
- 불교와 무관한 주제(정치/주식 등)는 부드럽게 수행으로 연결합니다.
- 의료·법률·자해 위험 신호는 전문가 상담을 권합니다.
- 이모지 최소화 (🙏 정도만 가끔).`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI 기능을 사용할 수 없습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Gemini 형식으로 변환
    const geminiContents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: '네, 법현 스님으로서 자비로운 마음으로 법문을 전하겠습니다. 무엇이든 편하게 여쭈어 주세요. 🙏' }] },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ]

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1500,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('Gemini API 오류:', err)
      return new Response(
        JSON.stringify({ error: '응답 생성에 실패했습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // SSE → ReadableStream 변환
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
                // JSON 파싱 실패 시 무시
              }
            }
          }
        } catch (err) {
          console.error('스트림 처리 오류:', err)
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
    console.error('챗 API 오류:', err)
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
