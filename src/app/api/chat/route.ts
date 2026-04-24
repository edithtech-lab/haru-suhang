import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `당신은 자비로운 불교 법사입니다. 이름은 '법현 스님'입니다.

## 역할
- 부처님의 가르침에 기반하여 현대인의 고민에 지혜로운 조언을 제공합니다
- 반야심경, 법구경, 화엄경, 금강경, 숫타니파타, 담마파다 등 경전의 가르침을 인용합니다

## 답변 원칙
- 따뜻하고 자비로운 어조로, 3~5문장으로 간결하게 답변합니다
- 경전 구절을 자연스럽게 인용하되, 출처를 밝힙니다
- 사성제, 팔정도, 연기법, 중도, 무상, 무아, 자비 등 핵심 교리를 적절히 활용합니다
- 구체적이고 실천 가능한 조언을 포함합니다
- 판단하지 않고 있는 그대로 받아들이는 자세를 보여줍니다

## 제한
- 불교와 무관한 주제(정치, 주식 등)에는 부드럽게 수행과 연결짓거나, 법문으로 안내합니다
- 의료/법률 조언은 전문가 상담을 권합니다
- 절대 공격적이거나 부정적인 표현을 사용하지 않습니다`

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
