# 사진 스타일 가이드 — Photo Style Guide

**작성일**: 2026-04-28
**근거**: 사용자 선호 4장 (v01·v02·v04·v05) 공통 DNA 분석
**용도**: 향후 페이지별 히어로 이미지 생성 시 일관된 톤 유지

## 0. 한 줄 정체성

> **"손 중심의 따뜻한 사이드 라이팅 매크로 — 얼굴 없는 명상의 순간"**

얼굴/풍경/스토리가 아니라 **손 그 자체**가 주인공.
조명·배경·디테일은 모두 손을 향해 수렴.

---

## 1. 6대 공통 원칙

### 1.1 거리 — Close-up to Macro
- 미디엄 클로즈업 ~ 매크로 프레이밍
- 손이 화면 중심에 위치, **프레임의 40~80% 차지**
- 풀바디 X, 얼굴 풀샷 X
- 얼굴이 잡혀도 **턱/입술만 살짝**, 그것도 그림자 안에

### 1.2 조명 — Warm Side Rim Light
- **반드시 측면(side) 또는 약간 기울어진 광원**
- 색온도: **2700K~3500K** (호박·구릿빛, amber/copper)
- 빛 방향: 화면 우측 30~70% 위치에서 들어옴
- 빛이 손가락 윤곽을 따라 흐르며 **하이라이트 + 그림자 대비** 만듦
- 정면 라이팅 / 백라이트만 / 무드 없는 평광 X

### 1.3 배경 — Dark Earthy
- 매우 어두운 갈색·검정·딥 마룻바닥
- 색감: `#0a0604`, `#1a0e08`, `#2a1a10` 같은 깊은 어스 톤
- 배경 디테일: **블러 또는 단색 그라데이션**
- 절대 밝은 배경 X (스튜디오 화이트 X), 컬러풀한 배경 X

### 1.4 구도 — Hand-Centric
- 손이 **화면 중심** 또는 **3분할의 한 점**에 정확히
- 손 외 요소는 **보조** (염주·나무 마룻바닥·서예 등)
- 텍스트·로고·UI 요소 절대 X
- 인물 풀샷·얼굴 정면 X

### 1.5 얼굴 — Anonymous Abstraction
- **얼굴 0% 또는 익명 추상화**
- 허용: 턱 끝, 입술 옆선, 어깨, 한복 깃 — 그림자 안에서
- 금지: 눈·이목구비 식별 가능한 노출 (→ 인물 사진이 됨)
- 이유: **익명성 = 사용자 자신을 투영**할 여지

### 1.6 디테일 & DOF — Tactile Macro
- **얕은 피사계 심도** (Shallow DOF)
- 초점: 손 또는 손가락 끝
- 디테일: 손가락 마디, 핏줄, 살결, 그림자 전부 살아있음
- 배경: 부드럽게 블러, 보케 효과
- 필름 그레인 살짝 (디지털 노이즈 X)

---

## 2. 컬러 팔레트

### 핵심 8색
| 역할 | 색 | HEX | 비고 |
|---|---|---|---|
| 깊은 그림자 | 딥 차콜 | `#0a0604` | 가장 어두운 배경 |
| 어두운 갈색 | 다크 마호가니 | `#1a0e08` | 한복·나무 |
| 미디엄 어스 | 다크 시에나 | `#2a1a10` | 그라데이션 미드톤 |
| 살결 어두운 | 셰이드 스킨 | `#5a3a26` | 손 그림자 |
| 살결 미드 | 워머 스킨 | `#a87358` | 손 미드톤 |
| **하이라이트** | **호박** | **`#e8a868`** | 손가락 끝 |
| **글로우** | **구릿빛** | **`#c08a55`** | 림 라이트 |
| 따뜻한 흰색 | 크림 | `#f5e8d0` | 가장 밝은 점 |

### 사용 비율 (대략)
- 어두운 톤 (검정~갈색): **60~70%**
- 미드톤 (살결): **20~30%**
- 하이라이트 (호박~크림): **5~10%**

→ **압도적으로 어두움**. 빛은 점·선·작은 면적으로만.

---

## 3. Gemini 프롬프트 템플릿 (조립식)

### A. 시그니처 베이스 (모든 프롬프트 끝에 붙임)
```
deep amber and copper warm side rim lighting from the right,
dark muted brown background (#1a0e08 to #2a1a10),
shallow depth of field with hand in sharp focus,
visible film grain, dreamlike meditative atmosphere,
korean buddhist aesthetic,
no face visible (or only chin shadow, never eyes),
no logo, no text, no watermark,
3:4 vertical portrait orientation
```

### B. 거리·각도 모듈 (선택 1)
- `cinematic close-up framing of [subject], hands fill 50% of frame`
- `extreme macro close-up of [subject], hands fill 80% of frame, very shallow focus`
- `top-down view from above looking down at [subject], hands centered`
- `three-quarter angle view of [subject], slight tilt`

### C. 주체(subject) 모듈 (페이지별)
- 홈 / 합장 (anjali): `two hands pressed together in anjali mudra prayer position, fingertips up`
- 108배: `single open hand reaching to forehead in bowing gesture`
- 명상: `two hands resting on lap, palms up, thumbs touching forming oval (dhyana mudra)`
- 염불: `hand holding wooden mala prayer beads, fingers gently rolling a bead`
- 경전: `hand resting gently on aged korean hanji paper with ink calligraphy`
- 법문: `single index finger raised in vitarka mudra teaching gesture`
- 도반: `two different hands, fingertips just barely touching`
- 저널: `hand holding wooden brush writing korean calligraphy`

### D. 조립 예시 (홈)
```
Photograph: cinematic close-up framing of two hands pressed together
in anjali mudra prayer position, fingertips up, hands fill 50% of frame.

Subject wearing dark monk-like sleeves, no face visible.

[시그니처 베이스 그대로 붙임]
```

---

## 4. 회피 패턴 (선호 시안과 다른 톤)

다음은 본 가이드 톤이 **아닙니다** — 별도 용도로만 사용:

| 시안 | 톤 | 적합한 용도 |
|---|---|---|
| v03 옆 실루엣 | 황혼 + 풍경 + 실루엣 | 도반·소셜 카드 |
| v06 새벽 푸른빛 | Cool blue · 차분 | 명상 (cool variant) |
| v07 강한 적색 | Dramatic red rim · 영화 포스터 | 스플래시·캠페인 |
| v08 한지 배경 | Bright sepia · 자연광 | 경전 페이지 (밝은 톤) |
| v09 향연 인센스 | Smoky mystical · 사찰 인테리어 | 법문 페이지 (분위기 강조) |
| v10 달빛 | Cool moonlight · 일러스트 | 밤 모드 변주 |

→ 이들은 **다른 페이지**에서 별도 가이드로 사용. 홈/108배/염불 메인 톤은 위 1~3장으로 통일.

---

## 5. 사용자 선호 4장 분석 — 왜 이 톤인가

### v01 정면 합장
✅ 정면 직시 → 강한 임팩트
✅ 호박색 사이드 라이팅 → 시그니처 톤
✅ 손가락 마디 디테일 살아있음 → 인간미
✅ 얼굴은 그림자 안에 → 익명성

### v02 탑다운
✅ 다른 각도지만 톤 동일 → 시리즈 통일감
✅ 나무 마룻바닥 → 한국 사찰 정체성
✅ 빛이 손에 떨어지는 광경 → "수행의 순간" 메타포

### v04 손가락 매크로
✅ 극단적 매크로 → 명상의 응시
✅ 손 외 요소 0 → 가장 순수한 추상
✅ 살결 디테일 + 따뜻한 톤 → 촉각적

### v05 염주 함께
✅ 합장 + 염주 = 컨텍스트 풍부
✅ 사찰 배경 (서예) → 한국 정체성
✅ 영화적 분위기 → 브랜딩 강화

→ **공통**: 거리만 다르고 **조명·색·디테일·익명성**이 일관

---

## 6. 페이지별 적용 가이드 (개정)

본 가이드 톤(어두운 + 따뜻한 사이드 라이팅 + 손 중심):

| 페이지 | 모듈 조합 | 시안 참고 |
|---|---|---|
| 홈 (`/`) | 합장 + 정면 close-up | v01 |
| 108배 | 절하는 손 + close-up | v01 톤 + 절 자세 |
| 염불 | 염주 + 3/4 view | v05 |
| 경전 (어두운 ver) | 한지 위 손 + close-up | v04 매크로 톤 |
| 도반 | 두 손 + close-up | v04 톤 + 두 손 |

대안 톤 (별도 가이드):
- 명상 (cool indigo) → v06 톤
- 법문 (mystical) → v09 톤

---

## 7. 검수 체크리스트

새 이미지 생성 후 저장 전:

- [ ] 손이 화면 중심에 있는가?
- [ ] 측면 따뜻한 라이팅(호박/구릿빛)이 명확한가?
- [ ] 배경이 어두운 갈색·검정 톤인가?
- [ ] 얼굴이 보이지 않거나 그림자 안에 있는가?
- [ ] 얕은 DOF로 손이 강조되는가?
- [ ] 텍스트·로고·UI 요소가 없는가?
- [ ] 3:4 또는 9:16 세로 비율인가?
- [ ] 어두운 톤 60~70% 비율을 유지하는가?

---

## 8. 개정 이력

- **v1 (2026-04-28)**: 사용자 선호 4장(v01·v02·v04·v05) 공통 DNA 추출하여 작성
