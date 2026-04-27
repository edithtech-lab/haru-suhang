'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Trash2, LogIn } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getRecentMessages, saveMessage, clearChatHistory } from '@/lib/chat-store'
import { DAILY_WISDOMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { MoodBackdrop } from '@/components/mood-backdrop'
import { Mandala } from '@/components/mandala'
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
      <MoodBackdrop mood="amber" />

      {/* ===== 헤더 — Open 톤 ===== */}
      <header className="px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="label-upper">Wisdom</p>
            <h1 className="text-foreground text-[28px] tracking-tight mt-1.5 font-medium">
              법문
            </h1>
          </div>
          <p className="label-tag text-right max-w-[40%]">
            법현 스님께
            <br />
            여쭈어 보세요
          </p>
        </div>

        {/* 오늘의 법문 — 미니멀 인라인 */}
        <div className="border-t border-[var(--surface-border)] pt-4">
          <p className="label-tag mb-2">Today's wisdom</p>
          <p className="text-foreground/90 text-[14px] leading-[1.55] italic">
            &ldquo;{todayWisdom.text}&rdquo;
          </p>
          <p className="label-tag mt-2 text-right">— {todayWisdom.source}</p>
        </div>
      </header>

      {/* ===== 메시지 스크롤 영역 ===== */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* 추천 질문 */}
        {messages.length === 0 && historyLoaded && (
          <div className="space-y-4 pt-4">
            <p className="label-upper text-center text-foreground-dim">Suggested</p>
            <div className="flex flex-col gap-2">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={streaming || guestLimitReached}
                  className="surface-subtle hover:bg-[var(--surface-hover)] rounded-full px-5 py-3 text-[14px] text-foreground tracking-tight text-left transition-all active:scale-[0.98] disabled:opacity-30"
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
              msg.role === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center shrink-0 mt-1">
                <Mandala size={20} className="text-foreground/80" />
              </div>
            )}
            <div
              className={cn(
                'chat-bubble max-w-[82%] px-4 py-3 text-[14px] leading-[1.6] whitespace-pre-line tracking-tight',
                msg.role === 'user'
                  ? 'chat-bubble-user bg-foreground text-background'
                  : 'chat-bubble-assistant surface-paper text-foreground',
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* 스트리밍 중 */}
        {streaming && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center shrink-0 mt-1">
              <Mandala size={20} className="text-foreground/80" />
            </div>
            <div className="chat-bubble chat-bubble-assistant surface-paper text-foreground max-w-[82%] px-4 py-3 text-[14px] leading-[1.6] whitespace-pre-line tracking-tight">
              {streamingText || (
                <span className="inline-flex gap-1 items-center">
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
          <div className="surface-paper rounded-2xl p-4 flex items-center justify-between gap-3">
            <p className="text-foreground-dim text-[13px]">
              계속 대화하려면 로그인이 필요합니다
            </p>
            <button
              onClick={signInWithGoogle}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-full text-[12px] tracking-wide active:scale-95 transition-transform"
            >
              <LogIn size={12} />
              로그인
            </button>
          </div>
        </div>
      )}

      {/* ===== 입력창 ===== */}
      <div className="px-5 py-3 shrink-0 border-t border-[var(--surface-border)] bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={guestLimitReached ? '로그인 후 이용 가능합니다' : '법현 스님께 여쭈어 보세요...'}
              disabled={streaming || guestLimitReached}
              rows={1}
              className="w-full resize-none rounded-2xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted/50 bg-[var(--surface)] border border-[var(--surface-border)] focus:outline-none focus:border-[var(--accent-glow)] transition-colors disabled:opacity-30"
            />
          </div>
          <div className="flex gap-1 shrink-0">
            {user && messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                disabled={streaming}
                aria-label="대화 기록 삭제"
                className="w-11 h-11 rounded-full text-muted hover:text-danger transition-colors flex items-center justify-center disabled:opacity-30"
              >
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || streaming || guestLimitReached}
              aria-label="전송"
              className="w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
            >
              <Send size={15} strokeWidth={1.8} />
            </button>
          </div>
        </form>
        {!user && !guestLimitReached && (
          <p className="label-tag text-center mt-2">
            비로그인 {GUEST_LIMIT - guestCount}회 남음
          </p>
        )}
      </div>
    </div>
  )
}
