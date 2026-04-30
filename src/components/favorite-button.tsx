'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import {
  isFavorite,
  toggleFavorite,
  onFavoritesChange,
  type FavoriteType,
} from '@/lib/favorites-store'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  type: FavoriteType
  content: string
  meta?: Record<string, unknown>
  size?: number
  className?: string
}

export function FavoriteButton({
  id,
  type,
  content,
  meta,
  size = 14,
  className,
}: Props) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(isFavorite(id))
    return onFavoritesChange(() => setActive(isFavorite(id)))
  }, [id])

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    toggleFavorite({ id, type, content, meta })
  }

  return (
    <button
      onClick={handle}
      aria-label={active ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      className={cn(
        'flex items-center justify-center transition-colors p-2 -m-2',
        active ? 'text-accent' : 'text-foreground-dim hover:text-foreground',
        className,
      )}
    >
      <Heart
        size={size}
        strokeWidth={1.5}
        fill={active ? 'currentColor' : 'none'}
      />
    </button>
  )
}
