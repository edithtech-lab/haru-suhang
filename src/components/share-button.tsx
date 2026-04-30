'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  source?: string
  url?: string // 기본: 현재 페이지
  size?: number
  className?: string
}

export function ShareButton({
  text,
  source,
  url,
  size = 14,
  className,
}: Props) {
  const [copied, setCopied] = useState(false)

  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const shareUrl =
      url ?? (typeof window !== 'undefined' ? window.location.href : '')
    const shareText = source ? `"${text}"\n— ${source}` : `"${text}"`
    const title = '하루수행 · 오늘의 한마디'

    // 1) Web Share API (모바일 네이티브)
    type NavWithShare = Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>
    }
    const nav = navigator as NavWithShare
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title, text: shareText, url: shareUrl })
        return
      } catch {
        // 사용자가 취소했거나 실패 — fallback
      }
    }

    // 2) Fallback — 클립보드 복사
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 클립보드 실패 — 무시
    }
  }

  return (
    <button
      onClick={handle}
      aria-label="공유"
      title={copied ? '복사됨' : '공유'}
      className={cn(
        'flex items-center justify-center transition-colors p-2 -m-2',
        copied
          ? 'text-success'
          : 'text-foreground-dim hover:text-foreground',
        className,
      )}
    >
      {copied ? (
        <Check size={size} strokeWidth={1.5} />
      ) : (
        <Share2 size={size} strokeWidth={1.5} />
      )}
    </button>
  )
}
