import { cn } from '@/lib/utils'

type OrbVariant = 'amber' | 'peach' | 'cream' | 'deep'
type OrbSize = 'sm' | 'md' | 'lg' | 'xl'

interface AmbientOrbProps {
  variant?: OrbVariant
  size?: OrbSize
  className?: string
  animated?: boolean
  drift?: 1 | 2 | 3
  blur?: 'sm' | 'md' | 'lg' | 'xl'
}

const variantGradient: Record<OrbVariant, string> = {
  amber: 'var(--gradient-orb-amber)',
  peach: 'var(--gradient-orb-peach)',
  cream: 'var(--gradient-orb-cream)',
  deep: 'var(--gradient-orb-deep)',
}

const sizeClass: Record<OrbSize, string> = {
  sm: 'w-48 h-48',
  md: 'w-80 h-80',
  lg: 'w-[28rem] h-[28rem]',
  xl: 'w-[40rem] h-[40rem]',
}

const blurClass = {
  sm: 'blur-2xl',
  md: 'blur-3xl',
  lg: 'blur-[80px]',
  xl: 'blur-[120px]',
}

export function AmbientOrb({
  variant = 'amber',
  size = 'lg',
  className,
  animated = true,
  drift = 1,
  blur = 'lg',
}: AmbientOrbProps) {
  return (
    <div
      aria-hidden
      style={{ backgroundImage: variantGradient[variant] }}
      className={cn(
        'pointer-events-none absolute rounded-full',
        sizeClass[size],
        blurClass[blur],
        animated && `orb-drift-${drift}`,
        className,
      )}
    />
  )
}

/**
 * 홈/페이지 배경용 멀티 오브 컨테이너.
 * 여러 개의 ambient orb를 겹쳐 Open 스타일 배경 생성.
 */
export function AmbientBackdrop({
  preset = 'home',
  className,
}: {
  preset?: 'home' | 'meditation' | 'sutra' | 'doban'
  className?: string
}) {
  const presets = {
    home: (
      <>
        <AmbientOrb variant="amber" size="xl" drift={1} className="-top-32 -right-24 opacity-70" />
        <AmbientOrb variant="peach" size="lg" drift={2} className="top-1/3 -left-40 opacity-60" />
        <AmbientOrb variant="deep" size="lg" drift={3} className="bottom-0 right-0 opacity-50" />
      </>
    ),
    meditation: (
      <>
        <AmbientOrb variant="cream" size="xl" drift={1} className="top-0 left-1/2 -translate-x-1/2 opacity-80" />
        <AmbientOrb variant="amber" size="lg" drift={2} className="bottom-10 -right-20 opacity-50" />
      </>
    ),
    sutra: (
      <>
        <AmbientOrb variant="cream" size="lg" drift={1} className="-top-20 left-0 opacity-40" />
        <AmbientOrb variant="deep" size="md" drift={3} className="bottom-0 right-0 opacity-60" />
      </>
    ),
    doban: (
      <>
        <AmbientOrb variant="amber" size="lg" drift={1} className="top-0 -left-20 opacity-60" />
        <AmbientOrb variant="peach" size="md" drift={2} className="top-1/2 right-0 opacity-50" />
      </>
    ),
  }

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-0 overflow-hidden -z-10',
        className,
      )}
    >
      {presets[preset]}
      {/* 전체 페이퍼 오버레이 */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: 'var(--gradient-paper)' }}
      />
    </div>
  )
}
