'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Hand, Timer, BookOpen, MoreHorizontal, X, Sparkles, Calendar, Music, CircleDot, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAIN_NAV = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/bae108', icon: Hand, label: '108배' },
  { href: '/meditation', icon: Timer, label: '명상' },
  { href: '/yeobul', icon: BookOpen, label: '예불' },
]

const MORE_NAV = [
  { href: '/challenge', icon: Trophy, label: '챌린지' },
  { href: '/doban', icon: Users, label: '도반' },
  { href: '/yeomju', icon: CircleDot, label: '염주' },
  { href: '/sutra', icon: BookOpen, label: '경전' },
  { href: '/wisdom', icon: Sparkles, label: '법어' },
  { href: '/ambient', icon: Music, label: '음향' },
  { href: '/calendar', icon: Calendar, label: '캘린더' },
]

export function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const isMoreActive = MORE_NAV.some(item => item.href === pathname)

  return (
    <>
      {/* 더보기 패널 */}
      {showMore && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#1a1410] border-t border-card-border rounded-t-2xl p-4 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">더보기</h3>
              <button onClick={() => setShowMore(false)} className="p-1 text-muted">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {MORE_NAV.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors',
                    pathname === href ? 'text-accent bg-accent/10' : 'text-muted hover:text-foreground'
                  )}
                >
                  <Icon size={22} />
                  <span className="text-[11px] font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-card-border bg-[#1a1410]/95 backdrop-blur-md safe-area-bottom">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {MAIN_NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                  active ? 'text-accent' : 'text-muted hover:text-foreground'
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setShowMore(true)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
              isMoreActive ? 'text-accent' : 'text-muted hover:text-foreground'
            )}
          >
            <MoreHorizontal size={22} strokeWidth={isMoreActive ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">더보기</span>
          </button>
        </div>
      </nav>
    </>
  )
}
