'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'serif'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-accent text-[#0e0b08] font-semibold hover:bg-accent-light',
      secondary: 'surface-paper text-foreground font-medium hover:bg-[var(--surface-hover)]',
      outline: 'border border-[var(--surface-strong-border)] text-foreground font-medium hover:bg-[var(--surface-hover)]',
      ghost: 'text-muted hover:text-foreground hover:bg-[var(--surface)]',
      gradient: 'bg-gradient-to-r from-accent-deep via-accent to-accent-light text-[#0e0b08] font-semibold shadow-lg shadow-[var(--accent-glow)]',
      serif: 'font-serif text-accent-light border-b border-[var(--accent-glow)] rounded-none px-1 hover:text-accent',
    }

    const sizes = {
      sm: 'px-5 py-2 text-sm rounded-full',
      md: 'px-7 py-3 text-base rounded-full',
      lg: 'px-9 py-4 text-lg rounded-full',
    }

    // serif variant은 rounded-full을 오버라이드
    const sizeClass = variant === 'serif' ? 'text-base py-1' : sizes[size]

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
