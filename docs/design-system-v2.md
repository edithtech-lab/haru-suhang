# haru-suhang 디자인 시스템 v2

## 배경

**작성일**: 2026-04-22
**방향**: Open (o-p-e-n.com) 브랜드 톤 차용 + 한국 젠 미학
**참고 앱**: Open (Breathwork & Meditation), Endel, Portal, Mesmerize

### 왜 Open인가
- 반복·집중·기록 구조가 haru-suhang과 동일 (호흡 세션 트래킹)
- 호흡 오브 = 108배 한 번의 리듬과 동일한 메타포
- 세리프 에디토리얼 타이포 = 불경 한자 혼용에 최적
- 구현 난이도 낮음 (WebGL 없이 Canvas/SVG + CSS)
- 정서 일치: 엔터테인먼트가 아닌 내면 집중

### 무엇이 바뀌는가 (v1 → v2)
| 항목 | v1 | v2 |
|---|---|---|
| 타이포 | Pretendard 단일 | Pretendard + Noto Serif KR 혼용 |
| 색 | 골드 브라운 accent | 톤다운 엠버 + 피치 + 크림 |
| 배경 | 단색 다크 브라운 | Ambient orb 블러 그라데이션 |
| 카드 | 글래스 모피즘 | 최소 테두리 + 종이 느낌 |
| 아이콘 | lucide-react 중심 | 텍스트 라벨 + SVG 심볼 (최소화) |
| 레이아웃 | 섹션 빽빽 | 풀스크린 여백 + 에디토리얼 계층 |

---

## 1. 색 시스템

### 베이스
```css
--background: #0e0b08        /* 딥 브라운 블랙 */
--foreground: #f2ece3        /* 따뜻한 오프화이트 */
--foreground-dim: #c8bdae    /* 부드러운 크림 */
--muted: #7a6e5f             /* 차분한 베이지 그레이 */
--muted-deep: #4a4037        /* 더 깊은 베이지 */
```

### 액센트
```css
--accent: #d4a574            /* 톤다운 엠버 (메인 포인트) */
--accent-light: #e8cfa8      /* 부드러운 피치 */
--accent-deep: #9c7a52       /* 앤티크 브론즈 */
--accent-glow: rgba(212, 165, 116, 0.15)  /* 글로우 */
```

### 시맨틱
```css
--success: #8fb88d           /* 차분한 세이지 그린 */
--danger: #c97166            /* 톤다운 테라코타 */
```

### 카드/표면
```css
--surface: rgba(255, 248, 238, 0.03)
--surface-border: rgba(242, 236, 227, 0.06)
--surface-hover: rgba(255, 248, 238, 0.05)
```

### 그라데이션
```css
--gradient-orb-amber:    radial-gradient(circle, #d4a574 0%, transparent 70%)
--gradient-orb-peach:    radial-gradient(circle, #e8a88a 0%, transparent 70%)
--gradient-orb-cream:    radial-gradient(circle, #d4c0a5 0%, transparent 70%)
--gradient-orb-deep:     radial-gradient(circle, #6b4e3a 0%, transparent 70%)
--gradient-paper:        linear-gradient(180deg, rgba(242,236,227,0.02), transparent)
```

---

## 2. 타이포그래피

### 폰트 패밀리
- **산세리프 (본문/UI)**: Pretendard Variable
- **세리프 (제목/인용/한자)**: Noto Serif KR (신규)
- **숫자 (스트릭/카운트)**: Noto Serif KR (세리프 숫자 — 에디토리얼 포인트)

### 스케일
```
--text-display:   clamp(2.5rem, 8vw, 4rem)    /* 히어로 타이틀 */
--text-headline:  clamp(1.75rem, 5vw, 2.5rem) /* 섹션 타이틀 */
--text-title:     1.5rem                      /* 카드 타이틀 */
--text-body:      1rem                        /* 본문 */
--text-caption:   0.8125rem                   /* 캡션 */
--text-micro:     0.6875rem                   /* 라벨/태그 */
```

### 사용 규칙
- **Display/Headline**: 반드시 **세리프** + `tracking-tight` + `leading-[1.1]`
- **Title**: 세리프 (카드 제목), 산세리프 (UI 제목)
- **Body**: 산세리프 (Pretendard)
- **Caption/Micro**: 산세리프 + `uppercase` + `tracking-widest`
- **인용 (법어)**: 세리프 italic 가능, 큰 따옴표 장식 문자

### 한자 혼용
- 경전/법어는 한글 + 한자 괄호 병기 허용 (예: 반야심경 般若心經)
- 세리프 폰트가 한자도 지원 → 통일감

---

## 3. 여백·레이아웃

### 페이지 패딩
- 모바일: `px-6 py-10` (v1: `px-5 py-8` → 확장)
- 섹션 간: `space-y-12` (v1: `space-y-8` → 확장)

### 최대 너비
- 기본: `max-w-lg` (유지)
- 리더 (경전): `max-w-xl`
- 이머시브 모드 (108배/명상/염불): 풀스크린 `max-w-none`

### 그리드
- 기능 카드: `grid-cols-3 gap-3` → 유지하되 카드 내 여백 넓힘
- 통계: 2~3 컬럼

---

## 4. 컴포넌트 스펙

### Card
- variants: `subtle` (기본), `paper`, `ghost`, `inset`
- **subtle**: 최소 테두리 + 배경 거의 투명
- **paper**: 종이 질감 + 따뜻한 그림자
- **ghost**: 테두리만
- **inset**: 음각 느낌 (스탯 카드)
- 모서리: `rounded-3xl` (v1: `rounded-2xl` → 더 부드럽게)
- 패딩: `p-6` (v1: `p-5` → 확장)

### Button
- variants: `primary`, `secondary`, `outline`, `ghost`, `serif` (신규)
- **serif**: 세리프 폰트 + 밑줄 링크 스타일 (에디토리얼 CTA)
- 크기: sm/md/lg 유지
- 모서리: `rounded-full` 기본 (v1: `rounded-xl` → 더 젠)

### AmbientOrb (신규)
- 풀스크린 블러 그라데이션 오브
- props: `variant` (amber/peach/cream/deep), `position`, `size`, `animated`
- 용도: 홈 배경, 페이지 히어로
- 구현: CSS radial-gradient + blur + transform 애니메이션

### BreathingOrb (향후 108배)
- SVG 기반 호흡 동기화 오브
- 팽창 4s · 유지 2s · 수축 4s · 유지 2s
- 클릭 시 리플 효과

---

## 5. 모션

### 원칙
- 정적 요소 최소화 — 모든 것이 부드럽게 숨쉰다
- 빠른 반응 X, 여유있는 이징 O
- 기본 이징: `cubic-bezier(0.16, 1, 0.3, 1)` (슬로우 스타트)

### 주요 애니메이션
```css
@keyframes orb-drift {
  /* 배경 오브가 천천히 이동 (20s loop) */
}
@keyframes breathe {
  /* 4s in / 4s out */
}
@keyframes fade-up {
  /* 엔트리: 12px translate + opacity */
}
@keyframes shimmer {
  /* 세리프 텍스트 포인트 — 부드러운 광 */
}
```

### 스태거
- 엔트리: 50ms 간격, 최대 6개
- 나머지는 한 번에

---

## 6. 이미지 전략

### 현재 (v2 초기)
- **이미지 없이 시작** — CSS 그라데이션 + SVG로 플레이스홀더
- AmbientOrb가 배경 역할
- Open 톤에 맞춰 톤다운 유지

### 향후 (사용자가 Gemini로 생성 투입)
- 폴더: `public/images/{backgrounds,hero,wisdom,sutra,orbs,textures,onboarding}`
- 포맷: webp (반응형 여러 사이즈 또는 단일)
- 스타일 베이스: "minimalist editorial, warm earth tones, low saturation, subtle film grain, Korean zen aesthetic"

---

## 7. 접근성

- 대비비: 본문 4.5:1 이상 유지 (`--foreground` / `--background` = 12:1)
- 포커스 링: `outline: 2px solid var(--accent)` 유지
- 모션 감소: `prefers-reduced-motion` 시 오브 애니메이션 정지
- 터치 타겟: 최소 44px

---

## 8. 페이지별 적용 우선순위

### 1차 (이번 작업)
- [x] globals.css
- [x] layout.tsx (폰트)
- [x] AmbientOrb
- [x] Card, Button
- [x] 홈 `/`

### 2차 (확인 후)
- [ ] 108배 `/bae108` (BreathingOrb 도입)
- [ ] 명상 `/meditation`
- [ ] 염불 `/yeomju`

### 3차
- [ ] 경전 `/sutra` (에디토리얼 리더)
- [ ] 법어 `/wisdom`
- [ ] 도반 `/doban`
- [ ] 캘린더 `/calendar`

---

## 9. 참고 레퍼런스

- **Open** (o-p-e-n.com / iOS 앱) — 메인 톤
- **Endel** — 명상·염불 비주얼 참고 (2차)
- **Balance**, **Opal**, **Calm** — 보조 참고
- **한국 사찰 단청**, **한지**, **조선 백자** — 문화 무드
