/**
 * MoodBackdrop — 페이지 전체에 매우 미묘한 색조 글로우를 깐다.
 * Open 앱의 시네마틱 lighting 참고. 채도 낮고 깊이감 있게.
 *
 * 사용:
 *   <MoodBackdrop mood="warm-dusk" />
 *   페이지 컴포넌트 최상단에 한 번만 배치.
 */

type Mood =
  | 'warm-dusk'
  | 'wine'
  | 'indigo'
  | 'olive'
  | 'sepia'
  | 'amber'
  | 'navy'
  | 'violet'
  | 'charcoal'

interface MoodBackdropProps {
  mood?: Mood
  /** 추가 노이즈/그레인 오버레이 (기본 true) */
  grain?: boolean
}

const moodVarMap: Record<Mood, string> = {
  'warm-dusk': 'var(--mood-warm-dusk)',
  wine: 'var(--mood-wine)',
  indigo: 'var(--mood-indigo)',
  olive: 'var(--mood-olive)',
  sepia: 'var(--mood-sepia)',
  amber: 'var(--mood-amber)',
  navy: 'var(--mood-navy)',
  violet: 'var(--mood-violet)',
  charcoal: 'var(--mood-charcoal)',
}

export function MoodBackdrop({ mood = 'warm-dusk', grain = true }: MoodBackdropProps) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 메인 그라데이션 */}
      <div
        className="absolute inset-0"
        style={{ background: moodVarMap[mood] }}
      />

      {/* 미세한 비네트 (가장자리 어둡게) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* 그레인 노이즈 (필름 질감) */}
      {grain && (
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
          }}
        />
      )}
    </div>
  )
}
