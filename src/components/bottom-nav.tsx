'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: '홈', sub: 'Home' },
  { href: '/bae108', label: '수행', sub: 'Practice', matchPaths: ['/bae108', '/meditation', '/yeomju'] },
  { href: '/sutra', label: '경전', sub: 'Sutras' },
  { href: '/wisdom', label: '법문', sub: 'Wisdom' },
  { href: '/doban', label: '도반', sub: 'Fellowship', matchPaths: ['/doban'] },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-lg px-4 pb-4">
        <div className="rounded-full surface-nav shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-around px-2 py-2">
            {NAV_ITEMS.map(({ href, label, sub, matchPaths }) => {
              const active = pathname === href || matchPaths?.some(p => pathname.startsWith(p))
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 rounded-full transition-all relative min-w-[54px]',
                    active ? 'text-accent-light' : 'text-muted hover:text-foreground-dim'
                  )}
                >
                  <span className={cn(
                    'font-serif text-[15px] leading-none',
                    active && 'text-accent-light'
                  )}>
                    {label}
                  </span>
                  <span className={cn(
                    'text-[8px] uppercase tracking-[0.22em] leading-none transition-opacity',
                    active ? 'opacity-80' : 'opacity-0'
                  )}>
                    {sub}
                  </span>
                  {active && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
