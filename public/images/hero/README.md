# Hero Images

홈 히어로 카드 + 페이지별 시작 화면 사진 저장 폴더.

## 파일 규칙
- 포맷: `.webp` 권장 (또는 `.jpg`)
- 비율: **9:16 또는 3:4** (모바일 세로)
- 해상도: 최소 1080x1440 (3:4) / 1080x1920 (9:16)
- 사이즈: < 200KB 권장 (webp 90% 품질 기준)

## 코드 사용처

| 파일명 | 사용처 | 비율 |
|---|---|---|
| `anjali.webp` | 홈 히어로 (108배·다음 수행) | 3:4 |
| `bow.webp` | 108배 페이지 시작 | 3:4 |
| `dhyana.webp` | 명상 페이지 시작 | 3:4 |
| `mala.webp` | 염불 페이지 시작 | 3:4 |
| `hanji.webp` | 경전 페이지 시작 | 3:4 |
| `dawn.webp` | 새벽 시간대 (홈) | 3:4 |
| `dusk.webp` | 황혼 시간대 (홈) | 3:4 |
| `night.webp` | 밤 시간대 (홈) | 3:4 |

이미지 없어도 코드는 깨지지 않습니다 (CSS 그라데이션 폴백).

## Gemini 이미지 생성 가이드

### 공통 시그니처 톤 (Open 톤)
모든 프롬프트 끝에 붙이면 통일감:
```
deep amber/copper warm rim light from the side,
dark brown background (#2a1a10),
shallow depth of field, soft motion blur on edges,
visible film grain, dreamlike meditative atmosphere,
korean buddhist aesthetic,
no face visible, no logo, no text,
9:16 vertical portrait
```

### 1. anjali.webp (합장 — 홈 메인) ⭐ 우선
```
Two hands pressed together in anjali mudra (prayer position),
fingertips pointing up, fingers gently aligned,
no face visible — only hands and partial wrist, dark sleeve,
cinematic close-up, deep amber side lighting,
dark muted background with subtle warmth,
shallow focus on fingertips, film grain, 9:16
```

### 2. bow.webp (절하는 손)
```
Single open hand reaching to touch forehead,
side profile of the bowing gesture,
warm copper rim light, dark brown ambient,
extreme close-up, shallow focus, contemplative, 9:16
```

### 3. dhyana.webp (선정인 — 명상)
```
Two hands resting on lap, palms facing up,
right hand cradling left, thumbs gently touching to form an oval,
indigo-blue cool side light fading into deep dark,
cross-legged meditation pose, only hands and dark fabric visible,
cinematic, film grain, 9:16
```

### 4. mala.webp (염주 — 염불)
```
Hand holding wooden mala prayer beads,
fingers gently rolling a single bead between thumb and index,
warm olive-green warm side light, dark muted background,
extreme macro close-up of fingers and beads,
shallow focus, contemplative, 9:16
```

### 5. hanji.webp (한지 — 경전)
```
Hand resting gently on aged korean hanji paper,
fingertips lightly touching ink calligraphy strokes,
warm sepia side light from window, dark mahogany surface beneath,
shallow depth, dust particles in light beam visible,
quiet contemplative, 9:16
```

### 6. dawn.webp (새벽)
```
Single hand silhouette against soft pre-dawn purple-blue mist,
cool indigo and pale gold gradient sky background,
gentle, hopeful, fresh start atmosphere,
no face visible, 9:16
```

### 7. dusk.webp (황혼)
```
Hands in anjali mudra silhouette against soft sunset sky,
warm copper and rose gold gradient, mist rising,
peaceful end-of-day mood, no face,
film grain, 9:16
```

### 8. night.webp (밤)
```
Hand near a single candle flame in deep darkness,
warm flickering candlelight on fingertips,
black surrounding background, intimate prayer mood,
no face visible, film grain, 9:16
```

## 검수 체크리스트

생성한 이미지 저장 전 확인:
- [ ] 얼굴이 보이지 않는가? (정체성 추상화)
- [ ] 톤이 어둡고 따뜻한가? (앱 정체성)
- [ ] 9:16 또는 3:4 비율인가?
- [ ] 텍스트/로고가 들어가지 않았는가?
- [ ] 손이 자연스러운 무드라인가?

## 비용 추정

Gemini 2.5 Flash Image (Nano Banana):
- 약 $0.039 / 이미지
- 8장 = ~$0.31 (약 430원)
- 시행착오 3배 = ~$0.93 (약 1,300원)

## 추가 시리즈 (장기)

성공 시 데일리 위즈덤 카드용 30~50장:
- 합장 변주 10장
- 두 손 (잡음·맞댐) 10장
- 자연 매크로 10장
- 한국 사찰 디테일 10장 (단청·기와·풍경)
