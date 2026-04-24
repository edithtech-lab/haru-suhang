import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'subtle' | 'paper' | 'ghost' | 'inset'
}

export function Card({ className, hover, variant = 'subtle', children, ...props }: CardProps) {
  const variants = {
    // v2 variants
    subtle: 'surface-subtle',
    paper: 'surface-paper',
    ghost: 'surface-ghost',
    inset: 'bg-[rgba(0,0,0,0.2)] border border-[var(--surface-border)]',

    // v1 호환
    default: 'surface-subtle',
    glass: 'glass',
    elevated: 'surface-paper card-elevated',
    gradient: 'gradient-border bg-gradient-to-br from-[var(--surface-strong)] to-transparent',
  }

  return (
    <div
      className={cn(
        'rounded-3xl p-6',
        variants[variant],
        hover && 'card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
