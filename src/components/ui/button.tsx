'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'link'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-foreground text-background font-medium hover:opacity-90',
      secondary: 'surface-paper text-foreground font-medium hover:bg-[var(--surface-hover)]',
      outline: 'border border-[var(--surface-strong-border)] text-foreground hover:bg-[var(--surface-hover)]',
      ghost: 'text-foreground-dim hover:text-foreground hover:bg-[var(--surface)]',
      gradient: 'bg-accent text-background font-medium hover:bg-accent-light shadow-lg shadow-[var(--accent-glow)]',
      link: 'text-foreground-dim hover:text-foreground underline-offset-4 hover:underline rounded-none px-0 py-0',
    }

    const sizes = {
      sm: 'px-5 py-2 text-sm rounded-full',
      md: 'px-7 py-3 text-base rounded-full',
      lg: 'px-9 py-4 text-base rounded-full',
    }

    const sizeClass = variant === 'link' ? 'text-sm' : sizes[size]

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-300',
          'disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]',
          'tracking-wide',
          variants[variant],
          sizeClass,
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
