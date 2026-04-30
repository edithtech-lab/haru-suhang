# 하루수행 — 출시 체크리스트

작성일: 2026-04-30

## 코드 / 배포 — 필수

### 환경변수 (Vercel 대시보드에서 확인)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `GEMINI_API_KEY` (AI 법현 스님 + 경전 해설)
- [ ] `GOOGLE_CLOUD_TTS_API_KEY` (TTS — 빌드에는 불필요, 스크립트 로컬 실행만)
- [ ] `OPENAI_API_KEY` (lab 비교용 — 출시에는 불필요, **rotate 필요**)

### 파일 / 페이지
- [x] OG 이미지 (`src/app/opengraph-image.tsx`)
- [x] 메타데이터 (layout.tsx) — title template, openGraph, twitter, keywords
- [x] manifest.json (PWA)
- [x] robots.txt (Allow / + Disallow /lab /api)
- [ ] sitemap.xml (선택)
- [ ] 404 페이지 (`src/app/not-found.tsx`) 확인
- [ ] 에러 페이지 (`src/app/error.tsx`) 확인

### 보안 / 운영
- [ ] Supabase RLS 모든 테이블 적용 (chat_messages, journal_entries, profiles 등)
- [ ] API 라우트 rate limit (chat 10/min, journal 5/min, wisdom 20/min) 동작 확인
- [ ] 입력 길이 검증 (chat 2000, journal 4000, wisdom 1000)
- [ ] OPENAI_API_KEY 폐기 (lab 비교 후 rotate)
- [ ] 콘솔 에러 0개 (production 빌드 후 폰에서 확인)

## 콘텐츠 점검

- [ ] 음성 가이드 4명 인도자 모두 자연스러운지 (Google TTS)
- [ ] 반야심경 가독성 (단락 분리 + 인용구) 정상 동작
- [ ] AI 법현 스님 응답 길이 정상 (최소 5문장, 최대 1500 토큰)
- [ ] 즐겨찾기 ♡ 모든 페이지에서 동작 (Home / 경전 / 법문)
- [ ] 수행자 종 알림 (분 단위) 정상 동작
- [ ] 공유 버튼 (Web Share API) iOS/Android 모두 동작

## UX / 디자인

- [ ] 모든 mood backdrop 9가지 (warm-dusk · wine · indigo · olive · sepia · amber · navy · violet · charcoal) 정상
- [ ] 화면 크기별 반응형 (iPhone SE → iPhone 16 Pro Max → iPad)
- [ ] BottomNav 5탭 모두 활성 (Home · Practice · Wisdom · Sutras · Me)
- [ ] 다크 모드 일관성 (배경 #000)
- [ ] Pretendard 폰트 로드 (CDN preconnect)

## 모바일 테스트

### iOS
- [ ] Safari에서 모든 페이지 정상
- [ ] PWA로 홈 화면 추가 동작
- [ ] 음성 가이드 화면 안 꺼짐 (Wake Lock)
- [ ] 카운트 사운드 재생 (AudioContext resume)
- [ ] iOS 자이로 권한 (DeviceOrientationEvent) 정상

### Android
- [ ] Chrome에서 모든 페이지 정상
- [ ] PWA 설치 가능
- [ ] 음성 자이로 둘 다 정상

## SEO / 검색 엔진

- [x] 메타데이터 (title, description, keywords)
- [x] openGraph (카톡·SNS 공유 미리보기)
- [x] twitter card
- [x] robots.txt (검색 허용)
- [x] manifest.json
- [ ] Google Search Console 등록
- [ ] Naver Search Advisor 등록
- [ ] sitemap.xml 제출 (선택)

## 마케팅 자산

- [x] 사이트 OG 이미지 (1200×630)
- [ ] 앱 아이콘 (192×192, 512×512) 디자인 확인
- [ ] Splash 이미지 (PWA)
- [ ] 인스타 카드 9장 (마케팅 plan 참조)
- [ ] 첫 블로그 글 1편 (네이버)

## 알려진 제약사항 (출시 후 개선)

- 수행자 종 = 인앱만 동작 (앱이 열려 있을 때). PWA 푸시는 Phase 2
- 즐겨찾기 = localStorage만. 클라우드 동기화는 Phase 2
- 결제 = 미구현. 출시 후 3개월 무료 이후 도입
- 경전 낭독 = 반야심경만. 천수경/금강경/신심명은 Phase 2
- 명상 가이드 라이브러리 = 빈 상태. 콘텐츠 제작 필요

## 출시 후 첫 1주 모니터링

- [ ] Vercel Analytics 설치
- [ ] 에러 추적 (Sentry 또는 Vercel 에러 로그)
- [ ] Supabase 사용량 (요청 수, DB 용량)
- [ ] Gemini API 호출 비용
- [ ] 사용자 피드백 채널 (이메일 edithtech@edithtech.co.kr)

## 도메인

- 현재: `haru-suhang.vercel.app`
- 추후: 커스텀 도메인 연결 (예: harusuhang.com 또는 .kr)

## 응급 절차

만약 출시 후 큰 버그 발견 시:
1. Vercel 대시보드에서 이전 배포로 즉시 롤백
2. main 브랜치에 hotfix 커밋 → push → 자동 재배포
3. 사용자 공지 (Home 상단 배너 또는 Twitter)
