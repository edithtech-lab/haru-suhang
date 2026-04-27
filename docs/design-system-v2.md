# haru-suhang 디자인 시스템 v2.2

**작성일**: 2026-04-22 (v2 초안)
**최종 갱신**: 2026-04-27 (v2.2)
**참고 앱**: Open (Breathwork & Meditation) — App Store Editor's Choice

## 핵심 원칙 (5대 원칙)

### 1. 베이스는 순수 검정 + 오프화이트
- `--background: #000000` 외 다른 베이스 색 사용 금지
- 텍스트는 `--foreground: #f5f0e8` (오프화이트)
- 어두운 톤은 `--surface: rgba(255,255,255,0.03)` 같은 alpha overlay로만

### 2. 폰트는 산세리프 통일 (Pretendard)
- **세리프(Noto Serif KR) 사용 금지** — 단, 한자 본문(경전)에서만 예외 허용
- `gradient-text` 클래스 사용 금지 — 옛 v1 잔재
- 영문 라벨은 항상 `uppercase + tracking` (`label-upper` / `label-tag` 사용)

### 3. 시네마틱 무드 그라데이션 (페이지별)
- 각 페이지에 `<MoodBackdrop mood="..." />` 1개만 배치
- 매우 미묘한 채도(0.12~0.22) — 거의 검정인데 색조만 살짝
- 페이지별 무드는 **고정**:

| 페이지 | Mood |
|---|---|
| 홈 (`/`) | `warm-dusk` |
| 108배 (`/bae108`) | `wine` |
| 명상 (`/meditation`) | `indigo` |
| 염불 (`/yeomju`) | `olive` |
| 경전 (`/sutra`) | `sepia` |
| 법문 (`/wisdom`) | `amber` |
| 사운드 (`/sounds`) | `navy` |
| 마음기록 (`/journal`) | `violet` |
| 둘러보기 (`/discover`) | `charcoal` |
| 도반 (`/doban`) | `amber` |

### 4. 만다라 시그니처
- `<Mandala />` 컴포넌트 = 5겹 원 SVG (Open #3 차용)
- 적용처: 명상 select 화면, 108배 카운터 배경, 도반 챌린지 박스, 법문 챗 아바타
- 크기: 20 (아바타) / 64-68 (작은 박스) / 160-240 (큰 메인)

### 5. 영문 라벨 우선
- 모든 페이지 헤더는 `<p className="label-upper">English</p>` + 큰 한국어 제목
- 메타 정보(`Daily Practice · 4/27 일`, `12 min · Bow`)는 `label-tag`
- 한국어만 노출하는 옛 헤더 금지

---

## 디자인 토큰

### 색상
```css
--background:        #000000
--foreground:        #f5f0e8
--foreground-dim:    #a8a095
--muted:             #6b655c
--muted-deep:        #3d3934

--accent:            #e8763a   /* Open 시그니처 오렌지 */
--accent-light:      #f4a56f
--accent-deep:       #c45624
--accent-glow:       rgba(232, 118, 58, 0.2)

--success:           #8fb88d   /* 차분한 세이지 */
--danger:            #c97166
--live:              #e84a4a

--surface:           rgba(255, 255, 255, 0.03)
--surface-border:    rgba(255, 255, 255, 0.08)
--surface-strong:    rgba(255, 255, 255, 0.06)
--surface-strong-border: rgba(255, 255, 255, 0.12)
```

### 타이포 스케일
- `text-[40px]` — 히어로 카드 메인 제목
- `text-[28px]` — 페이지 타이틀
- `text-[22px]` — 그리드 카드 제목
- `text-[15px]` — 본문/리스트 아이템
- `text-[14px]` — 본문 보조
- `text-[12-13px]` — 작은 메타
- `text-[10-11px]` — 라벨 (uppercase)

### 모션
- 이징: `cubic-bezier(0.16, 1, 0.3, 1)` (`var(--ease-soft)`)
- 페이드인: `animate-in` (700ms)
- 스태거: `stagger-1` ~ `stagger-6` (50-500ms 간격)
- 호흡: `cubic-bezier(0.45, 0, 0.55, 1)` (`var(--ease-breath)`, 4-8초)

### 라벨 헬퍼
```css
.label-upper {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--foreground-dim);
}
.label-tag {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--muted);
}
```

---

## 컴포넌트 패턴

### 페이지 헤더 (필수)
```tsx
<header className="px-5 pt-5 pb-4">
  <div className="flex items-baseline justify-between">
    <div>
      <p className="label-upper">English Label</p>
      <h1 className="text-foreground text-[28px] tracking-tight mt-1.5 font-medium">
        한국어 제목
      </h1>
    </div>
    <p className="label-tag">서브 설명</p>
  </div>
</header>
```

### Bottom Sheet 모달 (Open #1)
- 검정 배경, rounded-t-3xl
- 상단 X 닫기 + 가운데 제목
- 옵션 리스트 — 얇은 구분선, ✓ 표시
- (이미 `meditation-timer.tsx`에 `BottomSheet`/`OptionRow` 구현됨)

### 큰 둥근 ▶ 버튼 (Open #2, #4)
```tsx
<button className="w-20 h-20 rounded-full border-[1.5px] border-foreground/30 hover:border-foreground hover:bg-foreground/5 flex items-center justify-center transition-all active:scale-95">
  <Play size={26} strokeWidth={1.2} fill="currentColor" className="translate-x-[2px]" />
</button>
```

### 풀스크린 미니멀 진행 화면 (Open #4 — 명상/108배)
```tsx
<div className="fixed inset-0 z-40 bg-black flex items-center justify-center" onClick={handleTap}>
  {/* 큰 만다라 또는 오브 */}
  {/* 거대한 카운트/시간 (텍스트 only) */}
  {/* 하단에 작은 정지 버튼 */}
</div>
```

### 카드 그리드 (Open #5/#6 — Discover)
- `aspect-[3/4]` (또는 `aspect-[16/9]` 첫 카드)
- 무드 그라데이션 배경 + 그레인 + 비네트
- 좌상단 큰 흰 라벨, 좌하단 메타

### 챌린지 박스 (Open #9 — 도반)
- 좌측: 만다라 박스 (검정, 24x24)
- 우측: APR 2026 라벨 + 큰 타이틀 + 그라데이션 아바타 3개 + 얇은 진행 선

---

## 페이지별 적용 가이드

### / (홈) — `warm-dusk`
- 헤더: 작은 인사말 + 큰 산세리프 "하루수행"은 사용 X (Open은 헤더 미니멀)
- 히어로 카드: aspect-[3/4] 영화적 그라데이션 + ▶
- 카드 아래: 카테고리 빠른 전환 (108배/명상/염불/사운드/전체)
- Practice 리스트
- Today's wisdom
- Explore 링크

### /bae108 (108배) — `wine`
- 풀스크린 검정 + 큰 만다라 (240px, 텍스트와 겹침)
- 거대한 카운트 숫자 (font-light, 120px+)
- "Tap to count" 안내
- 완료 시 미니멀 축하 화면

### /meditation (명상) — `indigo`
- Select: 만다라 + Duration 큰 텍스트 + 옵션 카드 3개 + ▶ (이미 적용됨)
- Running: 풀스크린 미니멀 (이미 적용됨)
- Completed: 미니멀 (이미 적용됨)

### /yeomju (염불) — `olive`
- 108배와 비슷한 패턴: 만다라 + 카운트 + 진언 텍스트
- 모드 선택 (염주/독경)은 미니멀 탭

### /sutra (경전) — `sepia`
- 리스트: 큰 텍스트 + 작은 메타 (기존 인물 사진 이미지 placeholder는 추후)
- 디테일: 에디토리얼 리더 (한자 혼용은 Noto Serif KR 예외 허용)

### /wisdom (법문) — `amber`
- 헤더 미니멀 + 오늘의 법문 인라인
- 메시지 버블: 만다라 아바타 + surface-paper 버블
- 입력창: surface 톤

### /sounds — `navy`
- (이미 v2.2 톤 적용됨)

### /journal — `violet`
- (이미 v2.2 톤 적용됨)

### /discover — `charcoal`
- (이미 v2.2 톤 적용됨)

### /doban — `amber`
- (이미 만다라 박스 챌린지 카드 적용됨)

---

## 금지 패턴 (v1 잔재)

❌ `gradient-text` 클래스 사용
❌ Card variant `glass` / `gradient` 직접 사용 (대신 `surface-subtle` / `surface-paper`)
❌ `text-[#0f0d0a]` 같은 하드코딩 색
❌ `text-2xl font-bold gradient-text` 헤더 패턴
❌ `Sparkles` / `Trophy` / 큰 이모지 아이콘으로 헤더 장식
❌ `gradient-border` (옛 골드 보더)
❌ AmbientBackdrop / AmbientOrb 페이지 배경 (대신 MoodBackdrop)

---

## v2.2 완료 페이지 / 잔재 페이지

✅ **완료**: `/`, `/sounds`, `/journal`, `/discover`, `/doban`, `/wisdom`, `/meditation` (timer)
🔧 **부분 잔재**: `/bae108` (Counter108), `/yeomju` (Counter), `/sutra`
📅 **추후**: 위 잔재 페이지를 다음 작업으로 통일

---

## 개정 이력

- **v2 (2026-04-22)**: 초안 — Open 톤 차용 시작
- **v2.1 (2026-04-26)**: 산세리프 통일, 순수 블랙 베이스 전환
- **v2.2 (2026-04-27)**:
  - 시네마틱 무드 그라데이션 (9개)
  - MoodBackdrop, Mandala, BottomSheet 컴포넌트
  - 명상 타이머 전면 리워크
  - /discover, /journal, /sounds 신설
  - 본 가이드라인 명문화
