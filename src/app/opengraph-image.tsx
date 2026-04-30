import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '하루수행 · 일상 속 불교 수행'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(232, 118, 58, 0.22) 0%, transparent 60%), radial-gradient(ellipse 100% 80% at 50% 110%, rgba(60, 25, 12, 0.55) 0%, transparent 60%), linear-gradient(180deg, #0a0604 0%, #000 70%)',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* 따뜻한 글로우 */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '12%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(244, 165, 111, 0.30) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        {/* 작은 라벨 */}
        <div
          style={{
            fontSize: 18,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(232, 168, 100, 0.85)',
            marginBottom: 32,
            display: 'flex',
          }}
        >
          Daily Practice
        </div>

        {/* 메인 타이틀 */}
        <div
          style={{
            fontSize: 128,
            fontWeight: 600,
            color: '#fafaf9',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            display: 'flex',
          }}
        >
          하루수행
        </div>

        {/* 부제 */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(250, 250, 249, 0.7)',
            marginTop: 24,
            letterSpacing: '0.04em',
            display: 'flex',
          }}
        >
          일상 속 불교 수행
        </div>

        {/* 한자 */}
        <div
          style={{
            fontSize: 22,
            fontStyle: 'italic',
            color: 'rgba(232, 168, 100, 0.6)',
            marginTop: 80,
            letterSpacing: '0.18em',
            display: 'flex',
          }}
        >
          念念不離心
        </div>

        {/* 작은 설명 */}
        <div
          style={{
            position: 'absolute',
            bottom: 50,
            display: 'flex',
            gap: 36,
            fontSize: 16,
            color: 'rgba(250, 250, 249, 0.5)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <span>108 Bows</span>
          <span style={{ color: 'rgba(250, 250, 249, 0.25)' }}>·</span>
          <span>Meditation</span>
          <span style={{ color: 'rgba(250, 250, 249, 0.25)' }}>·</span>
          <span>Sutras</span>
          <span style={{ color: 'rgba(250, 250, 249, 0.25)' }}>·</span>
          <span>Wisdom</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
