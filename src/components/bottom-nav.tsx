'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Hand, Timer, BookOpen, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/bae108', icon: Hand, label: '108배' },
  { href: '/meditation', icon: Timer, label: '명상' },
  { href: '/yeobul', icon: BookOpen, label: '예불' },
  { href: '/wisdom', icon: Sparkles, label: '법어' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-card-border bg-[#1a1410]/95 backdrop-blur-md safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
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
      </div>
    </nav>
  )
}
