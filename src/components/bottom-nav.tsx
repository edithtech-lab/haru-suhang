'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Flame, Sparkles, BookOpen, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/bae108', label: 'Practice', icon: Flame, matchPaths: ['/bae108', '/meditation', '/yeomju'] },
  { href: '/sutra', label: 'Sutras', icon: BookOpen },
  { href: '/wisdom', label: 'Wisdom', icon: Sparkles },
  { href: '/doban', label: 'Dharma', icon: Users, matchPaths: ['/doban'] },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom surface-nav">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-around px-3 pt-2.5 pb-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, matchPaths }) => {
            const active = pathname === href || matchPaths?.some(p => pathname.startsWith(p))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all relative min-w-[52px]',
                  active ? 'text-foreground' : 'text-muted hover:text-foreground-dim'
                )}
              >
                <Icon size={18} strokeWidth={active ? 1.8 : 1.3} />
                <span className={cn(
                  'text-[9px] uppercase tracking-[0.15em]',
                  active ? 'text-foreground' : 'text-muted',
                )}>
                  {label}
                </span>
                {active && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
