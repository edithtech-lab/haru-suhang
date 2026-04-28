import type { Metadata } from 'next'

// /lab/* 는 개발자 전용 시안 페이지 — 검색 엔진 노출 차단
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
