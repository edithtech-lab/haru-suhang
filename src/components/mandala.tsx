/**
 * Mandala — 5겹 원이 겹친 만다라 SVG (Open #3 차용)
 * 재사용을 위해 별도 컴포넌트로 분리.
 */

interface MandalaProps {
  size?: number
  /** 1~1.5. 외곽 원 5개의 중심 거리 비율 */
  spread?: number
  className?: string
  strokeWidth?: number
  /** 추가로 작은 안쪽 원을 그릴지 */
  inner?: boolean
}

export function Mandala({
  size = 160,
  spread = 0.55,
  className = 'text-foreground/70',
  strokeWidth = 0.8,
  inner = false,
}: MandalaProps) {
  const cx = size / 2
  const cy = size / 2
  const r = (size / 2) * 0.475
  const angles = [0, 72, 144, 216, 288]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180
        const dx = Math.cos(rad - Math.PI / 2) * (r * spread)
        const dy = Math.sin(rad - Math.PI / 2) * (r * spread)
        return (
          <circle
            key={i}
            cx={cx + dx}
            cy={cy + dy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        )
      })}
      {inner && (
        <circle cx={cx} cy={cy} r={r * 0.4} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
      )}
    </svg>
  )
}
