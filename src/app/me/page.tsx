'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getOrCreateProfile } from '@/lib/group-store'
import { MoodBackdrop } from '@/components/mood-backdrop'

interface MenuItem {
  href: string
  label: string
  english: string
  description: string
}

const MENU: MenuItem[] = [
  {
    href: '/calendar',
    label: '내 기록',
    english: 'Records',
    description: '수행 캘린더와 스트릭',
  },
  {
    href: '/journal',
    label: '마음기록',
    english: 'Journal',
    description: 'AI 법현 스님과 마음 돌봄',
  },
  {
    href: '/doban',
    label: '도반',
    english: 'Fellowship',
    description: '함께 수행하는 벗과 챌린지',
  },
  {
    href: '/settings',
    label: '설정',
    english: 'Settings',
    description: '사운드·알림·계정·데이터',
  },
]

export default function MePage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      getOrCreateProfile(user.id)
        .then(p => setDisplayName(p.display_name))
        .catch(() => setDisplayName(null))
    }
  }, [user])

  const fallbackName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    null
  const userName = displayName || fallbackName

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col">
      <MoodBackdrop mood="charcoal" />

      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <button
          onClick={() => router.back()}
          aria-label="뒤로"
          className="p-2 -ml-2 text-foreground-dim hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <p className="label-upper">Me</p>
        <div className="w-8" />
      </header>

      {/* 프로필 */}
      <section className="px-5 pb-8 animate-in">
        <p className="label-tag mb-2">My Space</p>
        <h1 className="text-foreground text-[28px] tracking-tight font-medium">
          {userName ? `${userName} 수행자님` : '내 공간'}
        </h1>
        {user ? (
          <p className="label-tag mt-2 truncate">{user.email}</p>
        ) : !loading ? (
          <Link
            href="/auth"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-accent border border-[var(--accent-glow)] rounded-full hover:bg-[var(--accent-glow)] transition-colors uppercase tracking-[0.18em]"
          >
            <LogIn size={11} />
            Sign in
          </Link>
        ) : null}
      </section>

      {/* 메뉴 리스트 */}
      <section className="animate-in stagger-1 px-5 pb-8">
        <ul className="space-y-0">
          {MENU.map((item, idx) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-baseline justify-between gap-4 py-5 border-b border-[var(--surface-border)] hover:bg-[var(--surface)] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-baseline gap-4 flex-1 min-w-0">
                  <span className="label-tag tabular-nums w-5 shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-[18px] tracking-tight group-hover:text-accent-light transition-colors">
                      {item.label}
                    </p>
                    <p className="label-tag mt-1 truncate">
                      {item.english} · {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  strokeWidth={1.5}
                  className="text-foreground-dim group-hover:text-accent transition-colors shrink-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 로그아웃 */}
      {user && (
        <div className="px-5 pb-8 mt-auto animate-in stagger-2">
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 mx-auto text-[12px] text-foreground-dim hover:text-danger transition-colors py-3"
          >
            <LogOut size={12} strokeWidth={1.5} />
            로그아웃
          </button>
        </div>
      )}

      {/* 푸터 (한자) */}
      <footer className="text-center pb-8 animate-in stagger-3">
        <p className="font-serif italic text-xs text-muted-deep tracking-wider">
          念念不離心
        </p>
      </footer>
    </div>
  )
}
