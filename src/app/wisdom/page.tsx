'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getRecentMessages, saveMessage, clearChatHistory } from '@/lib/chat-store'
import { DAILY_WISDOMS } from '@/lib/constants'
import { Send, Trash2, LogIn, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'

const SUGGESTED_QUESTIONS = [
  '명상 중 잡념이 많아요',
  '화가 날 때 어떻게 하나요',
  '무상이란 무엇인가요',
  '집착을 내려놓는 법',
]

const GUEST_LIMIT = 3
const GUEST_COUNT_KEY = 'haru-chat-guest-count'

function getGuestCount(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(GUEST_COUNT_KEY) || '0', 10)
}

function incrementGuestCount(): number {
  const count = getGuestCount() + 1
  localStorage.setItem(GUEST_COUNT_KEY, String(count))
  return count
}

export default function WisdomPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [guestCount, setGuestCount] = useState(0)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const todayWisdom = DAILY_WISDOMS[new Date().getDate() % DAILY_WISDOMS.length]

  useEffect(() => {
    if (authLoading) return
    if (user) {
      getRecentMessages(user.id).then(msgs => {
        setMessages(msgs)
        setHistoryLoaded(true)
      })
    } else {
      setGuestCount(getGuestCount())
      setHistoryLoaded(true)
    }
  }, [user, authLoading])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText, scrollToBottom])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || streaming) return

    if (!user) {
      const count = getGuestCount()
      if (count >= GUEST_LIMIT) return
      const newCount = incrementGuestCount()
      setGuestCount(newCount)
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setStreamingText('')

    if (user) {
      saveMessage(user.id, 'user', trimmed)
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) throw new Error('API 오류')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

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
            if (parsed.text) {
              fullText += parsed.text
              setStreamingText(fullText)
            }
          } catch {
            // 파싱 실패 무시
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullText || '답변을 생성할 수 없습니다. 다시 시도해 주세요.',
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMsg])

      if (user) {
        saveMessage(user.id, 'assistant', assistantMsg.content)
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '죄송합니다. 잠시 후 다시 여쭈어 주세요.',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setStreaming(false)
      setStreamingText('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleClear = async () => {
    if (!user) return
    if (!confirm('대화 기록을 모두 삭제하시겠습니까?')) return
    const ok = await clearChatHistory(user.id)
    if (ok) setMessages([])
  }

  const guestLimitReached = !user && guestCount >= GUEST_LIMIT

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)]">
      {/* 헤더 */}
      <div className="px-5 pt-8 pb-4 text-center shrink-0">
        <h1 className="text-2xl font-bold">
          <span className="gradient-text">법문</span>
        </h1>
        <p className="text-sm text-muted mt-1">부처님의 지혜로 마음의 안녕을</p>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-2">
        {/* 오늘의 법문 카드 */}
        <Card variant="gradient" className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <h2 className="text-xs font-semibold text-accent tracking-wide">오늘의 법문</h2>
          </div>
          <p className="text-[15px] leading-relaxed text-foreground/85 text-center">
            &ldquo;{todayWisdom.text}&rdquo;
          </p>
          <p className="text-sm text-accent/70 text-right font-medium">- {todayWisdom.source}</p>
        </Card>

        {/* 추천 질문 */}
        {messages.length === 0 && historyLoaded && (
          <div className="space-y-3">
            <p className="text-sm text-muted/50 text-center">부처님께 여쭈어 보세요</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={streaming || guestLimitReached}
                  className="px-4 py-2 text-sm rounded-full glass text-foreground/70 hover:text-accent transition-all disabled:opacity-30"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 대화 메시지 */}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-2.5',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                <span className="text-sm">🪷</span>
              </div>
            )}
            <div
              className={cn(
                'chat-bubble max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line',
                msg.role === 'user'
                  ? 'chat-bubble-user bg-accent text-[#0f0d0a]'
                  : 'chat-bubble-assistant glass text-foreground/85'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* 스트리밍 중 */}
        {streaming && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
              <span className="text-sm">🪷</span>
            </div>
            <div className="chat-bubble chat-bubble-assistant glass text-foreground/85 max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line">
              {streamingText || (
                <span className="inline-flex gap-1">
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="chat-typing-dot" style={{ animationDelay: '0.4s' }} />
                </span>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 비로그인 제한 */}
      {guestLimitReached && (
        <div className="px-5 py-3 shrink-0">
          <Card variant="glass" className="flex items-center justify-between">
            <p className="text-sm text-foreground/70">대화를 이어가려면 로그인이 필요합니다</p>
            <Button variant="gradient" size="sm" onClick={signInWithGoogle} className="gap-1.5 shrink-0">
              <LogIn size={14} />
              로그인
            </Button>
          </Card>
        </div>
      )}

      {/* 입력창 */}
      <div className="px-5 py-3 shrink-0 border-t border-card-border bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={guestLimitReached ? '로그인 후 이용 가능합니다' : '부처님께 여쭈어 보세요...'}
              disabled={streaming || guestLimitReached}
              rows={1}
              className="w-full resize-none glass rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30 disabled:opacity-30"
            />
          </div>
          <div className="flex gap-1.5">
            {user && messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                disabled={streaming}
                className="p-3 rounded-xl text-muted/40 hover:text-danger transition-colors disabled:opacity-30"
                title="대화 기록 삭제"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || streaming || guestLimitReached}
              className="p-3 rounded-xl bg-accent text-[#0f0d0a] disabled:opacity-30 transition-opacity"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        {!user && !guestLimitReached && (
          <p className="text-[11px] text-muted/30 text-center mt-1.5">
            비로그인 {GUEST_LIMIT - guestCount}회 남음
          </p>
        )}
      </div>
    </div>
  )
}
